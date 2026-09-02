import { Product, Order } from "@/types/shop";
import mockProducts from "@/mocks/products.json";

const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// Helper para reintento con Exponential Backoff con Jitter ante respuestas HTTP 429
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoffMs = 300): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (response.status === 429 && retries > 0) {
      const jitter = Math.random() * 200;
      await new Promise((res) => setTimeout(res, backoffMs + jitter));
      return fetchWithRetry(url, options, retries - 1, backoffMs * 2);
    }
    return response;
  } catch (err) {
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, backoffMs));
      return fetchWithRetry(url, options, retries - 1, backoffMs * 2);
    }
    throw err;
  }
}

export async function getProducts(filterSpecies?: "dog" | "cat"): Promise<Product[]> {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    const products = mockProducts as Product[];
    if (filterSpecies) {
      return products.filter((p) => p.species === filterSpecies || p.species === "both");
    }
    return products;
  }

  try {
    let filterFormula = "";
    if (filterSpecies) {
      filterFormula = `OR({especie} = '${filterSpecies === "dog" ? "Perro" : "Gato"}', {especie} = 'Ambos')`;
    }

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Productos?${filterFormula ? `filterByFormula=${encodeURIComponent(filterFormula)}` : ""}`;
    
    const response = await fetchWithRetry(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_PAT}` },
      next: { revalidate: 60 },
    });

    if (!response.ok) return mockProducts as Product[];

    const data = await response.json();
    return data.records.map((rec: any) => ({
      id: rec.id,
      name: rec.fields.nombre || "",
      slug: rec.fields.slug || "",
      brand: rec.fields.marca || "",
      species: rec.fields.especie === "Perro" ? "dog" : rec.fields.especie === "Gato" ? "cat" : "both",
      category: rec.fields.categoria_nombre || "General",
      description: rec.fields.descripcion || "",
      featured: rec.fields.destacado || false,
      active: rec.fields.activo !== false,
      variants: rec.fields.variantes || [],
    }));
  } catch (error) {
    return mockProducts as Product[];
  }
}

export async function createOrder(order: Partial<Order>): Promise<{ success: boolean; orderId?: string; hashSeguridad?: string }> {
  const hashSeguridad = order.trackingToken || "hash_" + Math.random().toString(36).substring(2, 12);
  const orderId = order.orderId || "ORD-" + Math.floor(100000 + Math.random() * 900000);

  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    return { success: true, orderId, hashSeguridad };
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Pedidos`;
    const payload = {
      records: [
        {
          fields: {
            id_orden: orderId,
            hash_seguridad: hashSeguridad,
            cliente_nombre: order.customer?.fullName,
            cliente_rut: order.customer?.rut,
            cliente_email: order.customer?.email,
            cliente_telefono: order.customer?.phone,
            direccion_envio: order.customer?.address,
            comuna: order.customer?.commune,
            costo_envio: order.shippingCost || 0,
            subtotal: order.subtotal || 0,
            total: order.total || 0,
            detalle_items: JSON.stringify(order.items || []).substring(0, 50000),
            estado_pago: order.paymentStatus || "Pendiente",
            metodo_pago: order.paymentMethod === "WhatsApp" ? "WhatsApp (Link/Transferencia)" : "Pasarela Online (Webpay/MP)",

          },
        },
      ],
    };

    const res = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return { success: res.ok, orderId, hashSeguridad };
  } catch (e) {
    return { success: false };
  }
}

// Rutina de limpieza serverless para cancelar ordenes huérfanas abandonadas (>30 min)
export async function cleanupOrphanOrders(): Promise<{ cleanedCount: number }> {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) return { cleanedCount: 0 };
  try {
    const filterFormula = "AND({estado_pago} = 'Pendiente', DATETIME_DIFF(NOW(), CREATED_TIME(), 'minutes') > 30)";
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Pedidos?filterByFormula=${encodeURIComponent(filterFormula)}`;
    const res = await fetchWithRetry(url, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } });
    if (!res.ok) return { cleanedCount: 0 };
    const data = await res.json();
    
    for (const record of data.records) {
      const updateUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Pedidos/${record.id}`;
      await fetchWithRetry(updateUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: { estado_pago: "Cancelado" } }),
      });
    }
    return { cleanedCount: data.records.length };
  } catch (e) {
    return { cleanedCount: 0 };
  }
}

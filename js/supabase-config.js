// ============================================================
// Configuración de Supabase para el quiz.
// La clave publicable es de uso público (va en el cliente) y está
// protegida por Row Level Security: el navegador NO puede leer las
// tablas directamente, solo llamar a las funciones RPC expuestas.
// ============================================================

const SUPABASE_URL = "https://qwuoashzyuxkrtyaqrla.supabase.co";
const SUPABASE_KEY = "sb_publishable_ChJ_Mz7NVy4zj0dfTMdVLw_Wxqt7ChG";

// Llama a una función RPC de Postgres vía PostgREST.
// Lanza un Error si la respuesta HTTP no es OK (para manejar red/servidor caídos).
async function rpc(fn, args = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`RPC ${fn} falló (${res.status}): ${detalle}`);
  }
  return res.json();
}

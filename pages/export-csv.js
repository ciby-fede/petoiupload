import { createClient } from '@supabase/supabase-js';
import { parse } from 'json2csv';

export async function getServerSideProps({ res }) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .order('inserted_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Supabase error:', error);
    res.statusCode = 500;
    res.end('Errore nel recupero dei dati dal database');
    return { props: {} };
  }

  // Se non ci sono dati, ritorna 204
  if (!data || data.length === 0) {
    res.statusCode = 204;
    res.end('Nessun dato trovato');
    return { props: {} };
  }

  try {
    // Converti i dati in CSV
    const fields = [
      'id',
      'timestamp',
      'pir',
      'touch_right',
      'touch_left',
      'light_right',
      'light_left',
      'ir_right',
      'ir_left',
      'label',
    ];

    const csv = parse(data, { fields });

    // Imposta intestazioni HTTP per download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sensor_data.csv"');
    res.write(csv);
    res.end();
  } catch (err) {
    console.error('Errore nella generazione del CSV:', err);
    res.statusCode = 500;
    res.end('Errore nella generazione del file CSV');
  }

  return { props: {} };
}

export default function ExportCSVPage() {
  // Questa pagina non renderizza nulla: serve solo per il download
  return null;
}

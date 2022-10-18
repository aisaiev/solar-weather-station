import SensorsDataChart from '../sensors-data-chart/SensorsDataChart';
import SensorsDataTable from '../sensors-data-table/SensorsDataTable';

function Main() {
  return (
    <main className="container pt-0">
      <article>
        <SensorsDataTable></SensorsDataTable>
        <SensorsDataChart></SensorsDataChart>
      </article>
    </main>
  );
}

export default Main;

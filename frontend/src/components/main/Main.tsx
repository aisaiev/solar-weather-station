import SensorsDataChart from '../sensors-data-chart/SensorsDataChart';
import SensorsDataTable from '../sensors-data-table/SensorsDataTable';

function Main() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <SensorsDataTable></SensorsDataTable>
        <SensorsDataChart></SensorsDataChart>
      </div>
    </main>
  );
}

export default Main;

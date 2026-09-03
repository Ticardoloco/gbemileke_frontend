import PatientDashboard from "@/screen/patient";
import {Suspense} from 'react'
const page = () => {
  return (
    <Suspense>
      <PatientDashboard />
    </Suspense>
  );
};

export default page;

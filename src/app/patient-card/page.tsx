import RegisterPatientCardPage from '@/screen/patient-card'
import {Suspense} from 'react'

const page = () => {
  return (
    <Suspense>
        <RegisterPatientCardPage/>
    </Suspense>
  )
}

export default page
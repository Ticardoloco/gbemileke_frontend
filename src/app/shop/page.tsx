import Shop from '@/screen/shop'
import {Suspense} from 'react'

const page = () => {
  return (
     <Suspense>
        <Shop/>
    </Suspense>
  )
}

export default page
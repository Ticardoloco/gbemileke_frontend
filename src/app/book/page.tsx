import BookPage from '@/screen/book'
import {Suspense} from 'react'
const page = () => {
  return (
     <Suspense>
        <BookPage/>
    </Suspense>
  )
}

export default page

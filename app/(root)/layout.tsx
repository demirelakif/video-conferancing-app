import StreamVideoProvider from '@/providers/StreamClientProvider'
import React, { ReactNode } from 'react'

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className='bg-dark-2'>
      <StreamVideoProvider>
        {children}
      </StreamVideoProvider>
    </main>
  )
}

export default RootLayout
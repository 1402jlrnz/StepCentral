import React from 'react'
import MetaData from './Layout/MetaData'

const Home = () => {
  return (
    <>
      <MetaData title={'Step Central | Home'} />
      <div className="container container-fluid">
        <h1 id="products_heading">Latest Footwear</h1>
        <p className="mt-4">Storefront coming in Phase 1.</p>
      </div>
    </>
  )
}

export default Home

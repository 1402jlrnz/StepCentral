import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Product from './Product/Product'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import MetaData from './Layout/MetaData'
import Loader from './Layout/Loader';
import Pagination from '@mui/material/Pagination';

import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '../actions/productActions'

const Home = () => {
    const [price, setPrice] = useState([1, 1000]);
    const [category, setCategory] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    let { keyword } = useParams();
    const dispatch = useDispatch();
    const { loading, products, productsCount, resPerPage, filteredProductsCount } = useSelector(state => state.products);

    const categories = [
        'Running',
        'Basketball',
        'Lifestyle'
    ]

    let count = productsCount;

    if (keyword || category) {
        count = filteredProductsCount
    }

    const handleChange = (event, newValue) => {
        setPrice(newValue);
    };

    function valuetext(price) {
        return `P${price.toString()}`;
    }

    useEffect(() => {

        dispatch(getProducts(currentPage, keyword, price, category))
    }, [currentPage, keyword, price, category]);

    return (
        <>
            <MetaData title={'Step Central | Buy Footwear'} />
            {loading ? <Loader /> : (<div className="container container-fluid">
                <h1 id="products_heading">Latest Footwear</h1>
                <section id="products" className="container mt-5">
                    <div className="row">
                        {keyword || category ? (
                            <>
                                <div className="col-6 col-md-3 mt-5 mb-5">
                                    <Box sx={{ width: 150 }}>
                                        <Slider
                                            getAriaLabel={() => 'Price Filter'}
                                            value={price}
                                            onChange={handleChange}
                                            valueLabelDisplay="on"
                                            getAriaValueText={valuetext}
                                            min={1}
                                            max={1000}

                                        />
                                    </Box>
                                    <div className="mt-5">
                                        <h4 className="mb-3">
                                            Categories
                                        </h4>

                                        <ul className="pl-0">
                                            {categories.map(categoryName => (
                                                <li
                                                    key={categoryName}
                                                    style={{ cursor: 'pointer', listStyle: 'none' }}
                                                    onClick={() => setCategory(categoryName)}
                                                    className={category === categoryName ? 'font-weight-bold' : ''}
                                                >
                                                    {categoryName}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            className="btn btn-block btn-secondary mt-3"
                                            onClick={() => { setCategory(''); setPrice([1, 1000]) }}
                                        >
                                            Clear Filters
                                        </button>

                                    </div>



                                </div>

                                <div className="col-6 col-md-9">
                                    <div className="row">
                                        {products.length === 0 ? (
                                            <div className="col-12"><h3>No products found</h3></div>
                                        ) : products.map(product => (
                                            <Product key={product._id} product={product} />
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            products.map(product => (
                                <Product key={product._id} product={product} />
                            ))
                        )}

                    </div>
                    {resPerPage < count && (
                        <div className="d-flex justify-content-center mt-5">
                            <Stack spacing={2}>
                                <Pagination
                                    count={Math.ceil(count / resPerPage)}
                                    page={currentPage}
                                    onChange={(event, value) => setCurrentPage(value)}
                                    color="primary"
                                    variant="outlined"
                                    shape="rounded"
                                    showFirstButton
                                    showLastButton
                                    size="large"
                                    sx={{
                                        backgroundColor: 'white',

                                    }}
                                />
                            </Stack>
                        </div>
                    )}
                </section>
            </div>)}
        </>
    )
}

export default Home

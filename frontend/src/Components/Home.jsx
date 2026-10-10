import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Product from './Product/Product'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import MetaData from './Layout/MetaData'
import Loader from './Layout/Loader';
import Pagination from '@mui/material/Pagination';
import { Switch } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '../actions/productActions'

const Home = () => {
    const [price, setPrice] = useState([1, 1000]);
    const [category, setCategory] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [infiniteScroll, setInfiniteScroll] = useState(false)
    const [allProducts, setAllProducts] = useState([])
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

    // Pagination mode: dispatch getProducts for current page
    useEffect(() => {
        if (!infiniteScroll) {
            dispatch(getProducts(currentPage, keyword, price, category))
        }
    }, [dispatch, currentPage, keyword, price, category, infiniteScroll]);

    // Infinite scroll: load all products progressively
    const observer = useRef(null);
    const loadMoreRef = useRef(null);

    const loadMore = useCallback(() => {
        if (loading || allProducts.length >= count) return;
        const nextPage = Math.ceil(allProducts.length / resPerPage) + 1;
        dispatch(getProducts(nextPage, keyword, price, category));
    }, [dispatch, loading, allProducts.length, count, keyword, price, category, resPerPage]);

    useEffect(() => {
        if (!infiniteScroll) return;

        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && allProducts.length < count) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );
        if (loadMoreRef.current) {
            observer.current.observe(loadMoreRef.current);
        }
        return () => { if (observer.current) observer.current.disconnect(); };
    }, [infiniteScroll, loading, allProducts.length, count, loadMore]);

    // Accumulate products in infinite scroll mode
    useEffect(() => {
        if (infiniteScroll) {
            // Only append new products if they're not already in the list
            const existingIds = new Set(allProducts.map(p => p._id));
            const newProducts = products.filter(p => !existingIds.has(p._id));
            if (newProducts.length > 0) {
                setAllProducts(prev => [...prev, ...newProducts]);
            }
        } else {
            setAllProducts([]);
        }
    }, [products, infiniteScroll]);

    const displayProducts = infiniteScroll ? allProducts : products;

    return (
        <>
            <MetaData title={'Step Central | Buy Footwear'} />
            {loading && allProducts.length === 0 ? <Loader /> : (
                <div className="container container-fluid">
                    <h1 id="products_heading">Latest Footwear</h1>
                    <section id="products" className="container mt-5">
                        <div className="row">
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
                                    <h4 className="mb-3">Categories</h4>
                                    <ul className="pl-0">
                                        {categories.map(categoryName => (
                                            <li
                                                key={categoryName}
                                                style={{ cursor: 'pointer', listStyle: 'none' }}
                                                onClick={() => { setCategory(categoryName); setCurrentPage(1); }}
                                                className={category === categoryName ? 'font-weight-bold' : ''}
                                            >
                                                {categoryName}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="btn btn-block btn-secondary mt-3"
                                        onClick={() => { setCategory(''); setPrice([1, 1000]); setCurrentPage(1); }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            <div className="col-6 col-md-9">
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="d-flex align-items-center">
                                            <Switch
                                                checked={infiniteScroll}
                                                onChange={(e) => { setInfiniteScroll(e.target.checked); setCurrentPage(1); setAllProducts([]); }}
                                                color="primary"
                                                size="small"
                                            />
                                            <span className="ml-2">Infinite Scroll</span>
                                        </label>
                                    </div>
                                    <div className="col-6 text-right">
                                        <small className="text-muted">
                                            Showing {displayProducts.length} of {count} products
                                        </small>
                                    </div>
                                </div>

                                <div className="row">
                                    {displayProducts.length === 0 ? (
                                        <div className="col-12"><h3>No products found</h3></div>
                                    ) : displayProducts.map(product => (
                                        <Product key={product._id} product={product} />
                                    ))}
                                </div>

                                {!infiniteScroll && resPerPage < count && (
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
                                                sx={{ backgroundColor: 'white' }}
                                            />
                                        </Stack>
                                    </div>
                                )}

                                {infiniteScroll && (
                                    <div ref={loadMoreRef} style={{ height: 20 }} />
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </>
    )
}

export default Home
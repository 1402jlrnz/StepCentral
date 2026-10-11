import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Product from './Product/Product'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import MetaData from './Layout/MetaData'
import Loader from './Layout/Loader';
import HeroSection from './Hero/HeroSection';
import '../HeroSection.css';

import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '../actions/productActions'

const Home = () => {
    const [price, setPrice] = useState([1, 1000]);
    const [category, setCategory] = useState('')
    let { keyword } = useParams();
    const dispatch = useDispatch();
    const { loading, products: reduxProducts, productsCount, resPerPage, filteredProductsCount } = useSelector(state => state.products);

    const categories = [
        'Running',
        'Basketball',
        'Lifestyle'
    ]

    let count = productsCount;
    if (keyword || category) {
        count = filteredProductsCount
    }

    const handlePriceChange = (event, newValue) => {
        setPrice(newValue);
    };

    function valuetext(price) {
        return `P${price.toString()}`;
    }

    // Infinite scroll: load all products progressively
    const [allProducts, setAllProducts] = useState([]);
    const observer = useRef(null);
    const loadMoreRef = useRef(null);

    const loadMore = useCallback(() => {
        if (loading || allProducts.length >= count) return;
        const nextPage = Math.ceil(allProducts.length / resPerPage) + 1;
        dispatch(getProducts(nextPage, keyword, price, category));
    }, [dispatch, loading, allProducts.length, count, keyword, price, category, resPerPage]);

    // Initial load
    useEffect(() => {
        dispatch(getProducts(1, keyword, price, category));
    }, [dispatch, keyword, price, category]);

    // IntersectionObserver for infinite scroll
    useEffect(() => {
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
    }, [loading, allProducts.length, count, loadMore]);

    // Accumulate products
    useEffect(() => {
        const existingIds = new Set(allProducts.map(p => p._id));
        const newProducts = (reduxProducts || []).filter(p => !existingIds.has(p._id));
        if (newProducts.length > 0) {
            setAllProducts(prev => [...prev, ...newProducts]);
        }
    }, [reduxProducts]);

    const displayProducts = allProducts.length > 0 ? allProducts : (reduxProducts || []);

    return (
        <>
            <MetaData title={'Step Central | Buy Footwear'} />

            {/* Design-only hero brand statement */}
            <HeroSection />

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
                                        onChange={handlePriceChange}
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
                                                onClick={() => { setCategory(categoryName); }}
                                                className={category === categoryName ? 'font-weight-bold' : ''}
                                            >
                                                {categoryName}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className="btn btn-block btn-secondary mt-3"
                                        onClick={() => { setCategory(''); setPrice([1, 1000]); }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            <div className="col-6 col-md-9">
                                <div className="row">
                                    {displayProducts.length === 0 ? (
                                        <div className="col-12"><h3>No products found</h3></div>
                                    ) : displayProducts.map(product => (
                                        <Product key={product._id} product={product} />
                                    ))}
                                </div>

                                <div ref={loadMoreRef} style={{ height: 20 }} />
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </>
    )
}

export default Home
import React from 'react'
import { Link } from 'react-router-dom'
import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Box,
    Rating,
    Button,
    Chip
} from '@mui/material'
import { formatPrice } from '../Utils/helpers'

const Product = ({ product }) => {
    return (
        <Box sx={{ p: { xs: 0.5, md: 1.5 } }} className="col-sm-12 col-md-6 col-lg-3 my-3">
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: '#ff3b3b'
                    }
                }}
            >
                <CardMedia
                    component="img"
                    image={product.images && product.images[0] ? product.images[0].url : '/images/default_avatar.jpg'}
                    alt={product.name}
                    sx={{
                        height: 180,
                        objectFit: 'contain',
                        p: 2,
                        backgroundColor: '#0f0f0f'
                    }}
                />

                <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                    <Typography
                        variant="h6"
                        component={Link}
                        to={`/product/${product._id}`}
                        sx={{
                            color: '#fafafa',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '1rem',
                            display: 'block',
                            mb: 0.5,
                            '&:hover': { color: '#ff3b3b' }
                        }}
                    >
                        {product.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                        <Rating
                            value={product.ratings}
                            precision={0.5}
                            readOnly
                            size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                            ({product.numOfReviews} reviews)
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography
                            variant="h6"
                            sx={{ color: '#ff3b3b', fontWeight: 800 }}
                        >
                            ₱{formatPrice(product.price)}
                        </Typography>
                        <Chip
                            label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            size="small"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                color: product.stock > 0 ? '#22c55e' : '#ef4444',
                                border: `1px solid ${product.stock > 0 ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                                backgroundColor: 'transparent'
                            }}
                        />
                    </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                        component={Link}
                        to={`/product/${product._id}`}
                        id="view_btn"
                        fullWidth
                        variant="contained"
                        color="primary"
                    >
                        View Details
                    </Button>
                </CardActions>
            </Card>
        </Box>
    )
}

export default Product

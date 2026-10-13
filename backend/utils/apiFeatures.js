require("../models/product");

class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {}

        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr };
        // Removing fields from the query
        const removeFields = ['keyword', 'page']
        removeFields.forEach(el => delete queryCopy[el]);

        let priceFilter = {};
        if (queryCopy['price[gte]'] || queryCopy['price[lte]']) {
            priceFilter.price = {};
            if (queryCopy['price[gte]']) {
                priceFilter.price.$gte = Number(queryCopy['price[gte]']);
            }
            if (queryCopy['price[lte]']) {
                priceFilter.price.$lte = Number(queryCopy['price[lte]']);
            }
            delete queryCopy['price[gte]'];
            delete queryCopy['price[lte]'];
        }

        // Apply remaining filters as-is (e.g. category, ratings)
        const finalFilter = { ...priceFilter, ...queryCopy };
        if (finalFilter.ratings) {
            finalFilter.ratings = Number(finalFilter.ratings)
        }

        // Review filter: has (>=1), none (0), or minimum count (min1, min5, min10)
        if (queryCopy.reviewFilter) {
            const rf = String(queryCopy.reviewFilter).trim();
            if (rf === 'has') {
                finalFilter.numOfReviews = { $gt: 0 };
            } else if (rf === 'none') {
                finalFilter.numOfReviews = 0;
            } else if (rf.startsWith('min')) {
                const min = Number(rf.slice(3));
                if (!isNaN(min)) finalFilter.numOfReviews = { $gte: min };
            }
            delete queryCopy.reviewFilter;
            delete finalFilter.reviewFilter;
        }

        this.query = this.query.find(finalFilter);
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);

        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
}
module.exports = APIFeatures;

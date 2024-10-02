import { reviews } from "@repo/database";

// Login/Register account response
export interface authResponse {
    status: boolean
    message?:string
    error?: {
        email?:string
        password?:string
        username?:string
        confirmPassword?:string
    }
}

// Search params for products page
export interface searchParams {
    query?: string 
    categories?: string,
    minPrice?: number,
    maxPrice?: number,
    rating?: string,
    sortBy?: string
    page?: number
}

// Product data
export interface Product {
    name: string,
    slug: string, 
    image_url: string,
    price: number,
    avg_rating: number,
    num_sold: number,
}

// Get all products (paginated)
export interface productsResponse {
    page?: number,
    length?: number,
    data?: Array<Product>
}

// Container to pass product data to Update Form
export interface productMutationData {
    name: string,
    slug: string,
    description: string, 
    image_url: string,
    price: number,
    stock?:number,
    categories?: Array<string> 
}

// Container for Image input
export interface imageInput {
    preview: string
}

// Create or Update product
export interface productMutationResponse {
    status: boolean
    message?:string
    slug?:string,
    error?: {
        name?:string
        description?:string
        image?:string
        price?:string
        stock?:string,
        categories?:string
    }
}

// Read reviews
export interface Review {
    user: string,
    rating: number,
    review: string
}

// Create or Update reviews
export interface reviewResponse {
    status: boolean,
    review: reviews,
    hasPurchased: boolean
}

// Get product with reviews
export interface productResponse extends Product {
    id: number,
    status: boolean,
    description: string,
    stock: number,
    categories?: Array<string>,
    reviews?: Array<Review>,
}

// Order data for a product
export interface orderResponse extends Product {
    quantity: number,
    rated_by?: number,
    stock?: number
}

// coordinates for address 
export interface coordinates {
    lat: number,
    lng: number
}

// coordinates and address name
export interface address extends coordinates {
    address?: string
}

// Geolocation data for address
export interface geolocationResponse {
    formatted_address: string,
    geometry: {
        location:{
            lat:number,
            lng:number
        }
    }
}

// Get transactions basic information
export interface transactionResponse {
    id: number,
    date: Date,
    status: string,
    total_price: number
}

// Get product details
export interface transactionHistoryDetails extends Product{
    quantity: number,
    rated_by?: number,
}

// Get transaction history details of a certain transaction
export interface transactionHistoryResponse {
    id:number,
    status:boolean,
    date: Date,
    address: string,
    delivery_cost: number,
    transaction_status: string
    details: Array<transactionHistoryDetails>
}

// Update Profile API Response (form validation)
export interface profileResponse {
    status?: boolean
    message?:string
    error?: {
        dob?:string,
        password?:string
        confirmPassword?:string
    }
}

// Get metrics for admin
export interface adminMetric {
    orders: number, 
    productsSold: number,
    revenues: number,
    customers: number,
    reviews: number
}

// Get order for admin 
export interface adminTransactions extends transactionResponse {
    user: string
}

// Get all products (paginated)
export interface adminOrdersResponse {
    page?: number,
    length?: number,
    data?: Array<adminTransactions>
}

// Admin page search params 
export interface adminSearchParams {
    month: number,
    page: number,
}

export interface orderMetrics {
    data: Array<{ month: number, total: number }>
}

export interface adminOrderMetrics extends orderMetrics {
    status: boolean
}

export interface authToken {
    id:number,
    email: string,
    name: string,
    role: string,
    dob?: Date,
}

type iOptions = {
    limit?: string | number,
    page?: string | number,
    sortBy?:string,
    sortOrder?:string
}
type iOptionsReturn = {
    limit: number,
    page: number,
    skip:number,
    sortBy:string | number,
    sortOrder:string |number
}


const calculatePagination = (options:iOptions):iOptionsReturn =>{
    const page = +(options.page!) || 1
    const limit = +(options.limit!) || 10
    const skip = (page - 1) * limit
    const sortBy = options.sortBy! || 'createdAt'
    const sortOrder = options.sortOrder! || "desc"

    return{page,limit,sortBy,sortOrder,skip}

}

export default calculatePagination
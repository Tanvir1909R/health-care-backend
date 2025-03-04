import pick from "./pick";

type iSearch={
    search?:string
}& object

const getFilterCondition = <q extends iSearch, pq extends keyof q>(queries:q, protectionQueries:pq[],searchQueries:string[],isDeleteStatusFunction:boolean) => {
  const { search, ...filterData } = pick(queries, protectionQueries) as Record<string,any>
  const orCondition: any[] = [];
  if (search) {
    orCondition.push({
      OR: searchQueries.map((field) => ({
        [field]: {
          contains: search as string,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    orCondition.push({
      AND: Object.keys(filterData).map((field) => ({
        [field]: {
          equals: filterData[field],
        },
      })),
    });
  }
  if(isDeleteStatusFunction){
    orCondition.push({
      isDeleted:false
    })
  }
  const andCondition: any = { AND: orCondition };

  return andCondition;
};

export default getFilterCondition;

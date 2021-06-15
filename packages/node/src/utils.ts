/* eslint-disable import/prefer-default-export */
export function parseFilterOrderObject(filterOrderObject: Record<string, any> = {})
  : Record<string, any> {
  const filterOrderBy: Record<string, any> = {}

  Object.keys(filterOrderObject).forEach((key) => {
    if (key.startsWith('_')) {
      filterOrderBy[key.substring(1)] = filterOrderObject[key]
      return
    }

    filterOrderBy.data = {
      [key]: filterOrderObject[key],
      ...filterOrderBy.data
    }
  })

  return filterOrderBy
}

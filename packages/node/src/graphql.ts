export const trackEventRequest = `
  mutation TrackEvent($input: TrackEventInput!) {
    trackEvent(input: $input) {
        id
    }
  }
`

export const identifyAccountRequest = `
  mutation IdentifyAccount($input: IdentifyAccountInput!) {
    identifyAccount(input: $input) {
        id
    }
  }
`

export const addContentRequest = `
  mutation AddContent($input: AddContentInput!) {
    addContent(input: $input) {
        id
        identifier
        position
        data
    }
  }
`

export const editContentRequest = `
  mutation EditContent($input: EditContentInput!) {
    editContent(input: $input) {
        id
        identifier
        position
        data
    }
  }
`

export const searchContentRequest = `
  query SearchContent($input: SearchContentInput!) {
    searchContent(input: $input)
  }
`

export const fetchContentRequest = `
  query FetchContentRequest($input: FetchContentInput!) {
    fetchContent(input: $input)
  }
`

export const createDeliveryRequest = `
  mutation CreateDelivery($input: CreateDeliveryInput!) {
    createDelivery(input: $input) {
        id
    }
  }
`

export const fetchItemRequest = `
  query FetchItem($input: FetchItemInput) {
    fetchItem(input: $input) {
        id
        installationId
        name
        identifier
        description
        createdAt
        updatedAt

        pricings {
            id
            amount
            originalAmount
            isRecurring
            recurringInterval
            recurringIntervalUnit
            currencyCode
            createdAt
            updatedAt
        }
    }
  }
`

const cart = `
  id
  status
  subtotal
  discount
  tax
  total

  orderItems {
      id
      quantity
      unitPrice
      subtotal
      discount
      tax
      total
  }

  couponRedemptions {
      coupon {
          name
          identifier
          discountType
          discountAmount
          currencyCode
          expiresAt
      }
  }
`

export const checkoutCartRequest = `
  query CheckoutCart($input: CheckoutCartInput!) {
    checkoutCart(input: $input) {
      ${cart}
    }
  }
`

const filters = {
  dropShadows: {
    icon: {
      blurRadius: 8
    }
  }
}

export default filters

export type DropShadowSize = keyof (typeof filters.dropShadows)

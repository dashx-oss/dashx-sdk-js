import React, { createContext, useState, ReactNode } from 'react'

import DashXSidebar from '../components/DashXSidebar'

type DashXContextType = {
  selected: string | number | null,
  store: any,
  setStore: React.Dispatch<any>,
  fields: Record<any, any>,
  isSidebarOpen: boolean
} | null

type DashXRootProps = {
  children: ReactNode,
  page: any
}

const DashXContext = createContext<DashXContextType>(null)

// Dummy data for fields, normalized by ContentType ID
// to be present in page.fields in future
const dummyFields = {
  524: {
    fields: [ {
      type: 'text',
      name: 'title'
    }, {
      type: 'text',
      name: 'subtitle'
    } ]
  },
  525: {
    fields: [ {
      type: 'text',
      name: 'heading'
    } ]
  }
}

function DashXRoot({ children, page }: DashXRootProps) {
  const [ store, setStore ] = useState(page)
  const [ selected, setSelected ] = useState<string | number | null>(null)
  const [ isSidebarOpen, setIsSidebarOpen ] = useState(false)

  const [ fields, setFields ] = useState(dummyFields)

  page.blocks = page.blocks.map((block: Record<string, any>) => (
    { ...block,
      blockProps: {
        onClick: () => {
          if (selected === block.id) {
            setIsSidebarOpen((prev) => !prev)
          }

          setSelected(block.id)
        },
        className: 'dash_hovered'
      } }
  ))

  return (
    <DashXContext.Provider value={{ selected, store, setStore, fields, isSidebarOpen }}>
      <style>{'.block::hover { border: 1px solid red }'}</style>
      {isSidebarOpen && <DashXSidebar />}
      {children}
    </DashXContext.Provider>
  )
}

export { DashXContext }

export default DashXRoot

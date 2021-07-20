import findIndex from 'lodash/findIndex'
import React, { ChangeEvent, useCallback, useContext } from 'react'
import { Field, Form } from 'react-final-form'

import { css } from '../styles/stitches'
import { DashXContext } from '../core/DashXRoot'

type Field = any
type Block = Record<string, any>

const sidebarStyles = css({
  right: 0,
  width: 300,
  height: '100vh',
  position: 'fixed',
  background: 'light100',
  zIndex: 'appScreen',
  padding: 20
})

const DashXSidebar = () => {
  const { fields, selected, store, setStore } = useContext(DashXContext)!

  const currentFields = fields[selected!]?.fields

  const initialValues = store?.blocks.find((block: Block) => block.id === selected)

  const generateInputOnChnage = useCallback(
    (field: Field) => (e: ChangeEvent<HTMLInputElement>) => {
      setStore(((prevStore: any) => {
        const index = findIndex(prevStore.blocks, [ 'id', selected ])
        prevStore.blocks[index >= 0 ? index : prevStore.blocks.length] = {
          ...prevStore.blocks[index], [field.name]: e.target.value
        }

        return { ...prevStore }
      }
      ))
    },
    [ selected, setStore ]
  )

  return (
    <div className={sidebarStyles}>
      <Form
        onSubmit={() => {}}
        initialValues={initialValues}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            {currentFields?.map((field: any) => (
              // Text for now
              <Field
                component="input"
                name={field.name}
                label={field.name}
                inputOnChange={generateInputOnChnage(field)}
              />
            ))}
          </form>
        )}
      />
    </div>
  )
}

export default DashXSidebar

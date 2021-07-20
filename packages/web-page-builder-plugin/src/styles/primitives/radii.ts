const radii = {
  $0: '0px',
  $2: '2px',
  $4: '4px',
  $6: '6px',
  $8: '8px',
  $10: '10px',
  $12: '12px',
  $14: '14px',
  $16: '16px',
  $18: '18px',
  $20: '20px',
  $24: '24px',
  $28: '28px',
  $32: '32px',
  $36: '36px',
  $40: '40px',
  $48: '48px',
  $60: '60px',
  $80: '80px',
  $full: '9999px'
}

export default radii

export type Radii = keyof (typeof radii)

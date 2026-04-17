// ============================================================
// FlightStatusBadge.test.jsx
//
// Prueba el componente de estado del vuelo.
// Verifica que muestre el texto y clase CSS correctos
// para cada uno de los 8 estados IATA AIDM.
// ============================================================

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FlightStatusBadge from '../components/flights/FlightStatusBadge'

describe('FlightStatusBadge', () => {

  it('muestra "A tiempo" para ON_TIME', () => {
    render(<FlightStatusBadge status="ON_TIME" />)
    expect(screen.getByText('A tiempo')).toBeInTheDocument()
  })

  it('muestra "Atrasado" para DELAYED', () => {
    render(<FlightStatusBadge status="DELAYED" />)
    expect(screen.getByText('Atrasado')).toBeInTheDocument()
  })

  it('muestra "En embarque" para BOARDING', () => {
    render(<FlightStatusBadge status="BOARDING" />)
    expect(screen.getByText('En embarque')).toBeInTheDocument()
  })

  it('muestra "Último llamado" para LAST_CALL', () => {
    render(<FlightStatusBadge status="LAST_CALL" />)
    expect(screen.getByText('Último llamado')).toBeInTheDocument()
  })

  it('muestra "Cerrado" para CLOSED', () => {
    render(<FlightStatusBadge status="CLOSED" />)
    expect(screen.getByText('Cerrado')).toBeInTheDocument()
  })

  it('muestra "En vuelo" para IN_FLIGHT', () => {
    render(<FlightStatusBadge status="IN_FLIGHT" />)
    expect(screen.getByText('En vuelo')).toBeInTheDocument()
  })

  it('muestra "Aterrizado" para LANDED', () => {
    render(<FlightStatusBadge status="LANDED" />)
    expect(screen.getByText('Aterrizado')).toBeInTheDocument()
  })

  it('muestra "Cancelado" para CANCELLED', () => {
    render(<FlightStatusBadge status="CANCELLED" />)
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
  })

  it('aplica la clase status-badge siempre', () => {
    const { container } = render(<FlightStatusBadge status="ON_TIME" />)
    expect(container.firstChild).toHaveClass('status-badge')
  })

  it('aplica la clase del estado correcto', () => {
    const { container } = render(<FlightStatusBadge status="DELAYED" />)
    expect(container.firstChild).toHaveClass('status-DELAYED')
  })

  it('aplica clase lg cuando size es lg', () => {
    const { container } = render(<FlightStatusBadge status="ON_TIME" size="lg" />)
    expect(container.firstChild).toHaveClass('lg')
  })

  it('no aplica clase lg por defecto', () => {
    const { container } = render(<FlightStatusBadge status="ON_TIME" />)
    expect(container.firstChild).not.toHaveClass('lg')
  })

  it('muestra el status como texto si no está en el mapa', () => {
    render(<FlightStatusBadge status="UNKNOWN_STATUS" />)
    expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument()
  })

})

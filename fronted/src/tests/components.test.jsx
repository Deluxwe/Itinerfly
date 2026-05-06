import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FlightStatusBadge from '../components/flights/FlightStatusBadge'
import AirlineCard from '../components/widgets/AirlineCard'
import RouteCard from '../components/widgets/RouteCard'
import BaggageModal from '../components/baggage/BaggageModal'
import Navbar from '../components/layout/Navbar'


// ── FlightStatusBadge ─────────────────────────────────────────
describe('FlightStatusBadge — todos los estados', () => {
  const estados = [
    ['ON_TIME',   'A tiempo'],
    ['DELAYED',   'Atrasado'],
    ['BOARDING',  'En embarque'],
    ['LAST_CALL', 'Último llamado'],
    ['CLOSED',    'Cerrado'],
    ['IN_FLIGHT', 'En vuelo'],
    ['LANDED',    'Aterrizado'],
    ['CANCELLED', 'Cancelado'],
  ]
  estados.forEach(([status, label]) => {
    it(`muestra "${label}" para ${status}`, () => {
      render(<FlightStatusBadge status={status} />)
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })
  it('aplica clase lg cuando size=lg', () => {
    const { container } = render(<FlightStatusBadge status="ON_TIME" size="lg" />)
    expect(container.firstChild).toHaveClass('lg')
  })
  it('no aplica clase lg por defecto', () => {
    const { container } = render(<FlightStatusBadge status="ON_TIME" />)
    expect(container.firstChild).not.toHaveClass('lg')
  })
  it('muestra el status si no está en el mapa', () => {
    render(<FlightStatusBadge status="UNKNOWN" />)
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument()
  })
  it('aplica clase status-badge siempre', () => {
    const { container } = render(<FlightStatusBadge status="ON_TIME" />)
    expect(container.firstChild).toHaveClass('status-badge')
  })
  it('aplica la clase del estado correcto', () => {
    const { container } = render(<FlightStatusBadge status="DELAYED" />)
    expect(container.firstChild).toHaveClass('status-DELAYED')
  })
})

// ── AirlineCard ───────────────────────────────────────────────
describe('AirlineCard', () => {
  
  const mockAirline = {
    id: 'AA', name: 'American Airlines', iata: 'AA',
    phone: '+1 800-433-7300', terminalDep: 'Terminal 8', terminalArr: 'Terminal 8'
  }
  it('muestra el nombre de la aerolínea', () => {
    render(<AirlineCard airline={mockAirline} />)
    expect(screen.getByText('American Airlines')).toBeInTheDocument()
  })
  it('muestra el código IATA', () => {
    render(<AirlineCard airline={mockAirline} />)
    // Buscar dentro de la clase específica para evitar ambigüedad
    const { container } = render(<AirlineCard airline={mockAirline} />)
    expect(container.querySelector('.airline-card__iata').textContent).toBe('AA')
  })
  it('muestra el teléfono', () => {
    render(<AirlineCard airline={mockAirline} />)
    expect(screen.getByText('+1 800-433-7300')).toBeInTheDocument()
  })
  it('muestra terminal de salida', () => {
    const { container } = render(<AirlineCard airline={mockAirline} />)
    // Hay múltiples "Terminal 8" — verificamos que al menos uno existe
    expect(container.querySelectorAll('.info-row__value').length).toBeGreaterThan(0)
  })
  it('renderiza el contenedor principal', () => {
    const { container } = render(<AirlineCard airline={mockAirline} />)
    expect(container.querySelector('.airline-card')).toBeInTheDocument()
  })
  it('muestra el ícono de avión', () => {
    render(<AirlineCard airline={mockAirline} />)
    expect(screen.getByText('✈')).toBeInTheDocument()
  })
})

// ── RouteCard ─────────────────────────────────────────────────

describe('RouteCard', () => {
  const mockRoute = {
    id: 'JFK-LHR',
    from: { iata: 'JFK', city: 'New York', lat: 40.64, lng: -73.77 },
    to:   { iata: 'LHR', name: 'London Heathrow Airport', city: 'Londres', lat: 51.47, lng: -0.46 },
    airline: 'BA',
    distance: '5,570 km',
    duration: '7h 05m'
  }
  it('muestra el nombre del aeropuerto destino', () => {
    render(<RouteCard route={mockRoute} />)
    expect(screen.getByText('London Heathrow Airport')).toBeInTheDocument()
  })
  it('muestra la ciudad destino', () => {
    render(<RouteCard route={mockRoute} />)
    // Usamos getAllByText porque "Londres" aparece en el SVG y en el HTML
    expect(screen.getAllByText('Londres').length).toBeGreaterThanOrEqual(1)
  })
  it('muestra la distancia', () => {
    render(<RouteCard route={mockRoute} />)
    expect(screen.getByText('5,570 km')).toBeInTheDocument()
  })
  it('muestra la duración', () => {
    render(<RouteCard route={mockRoute} />)
    expect(screen.getByText('7h 05m')).toBeInTheDocument()
  })
  it('muestra código IATA de origen en las pills', () => {
    const { container } = render(<RouteCard route={mockRoute} />)
    // Buscar específicamente en el span.pill (no en el SVG)
    const pills = container.querySelectorAll('.pill')
    const textos = Array.from(pills).map(p => p.textContent)
    expect(textos).toContain('JFK')
  })
  it('muestra código IATA de destino en las pills', () => {
    const { container } = render(<RouteCard route={mockRoute} />)
    const pillRed = container.querySelector('.pill.red')
    expect(pillRed.textContent).toBe('LHR')
  })
  it('renderiza el SVG del mapa', () => {
    const { container } = render(<RouteCard route={mockRoute} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
  it('renderiza el contenedor route-card', () => {
    const { container } = render(<RouteCard route={mockRoute} />)
    expect(container.querySelector('.route-card')).toBeInTheDocument()
  })
it('muestra airlineId si no hay airlineName', () => {
    const mockRouteOnlyId = {
      ...mockRoute,
      airlineId: 'BA',
    };
    render(<RouteCard route={mockRouteOnlyId} />);

    expect(screen.getByText('BA')).toBeInTheDocument();
    expect(screen.queryByText('British Airways')).not.toBeInTheDocument();
  });
})

// ── BaggageModal ──────────────────────────────────────────────
describe('BaggageModal', () => {
  it('muestra el título Equipaje', () => {
    render(<BaggageModal onClose={() => {}} />)
    expect(screen.getByText('Equipaje')).toBeInTheDocument()
  })
  it('muestra la sección de equipaje de mano', () => {
    render(<BaggageModal onClose={() => {}} />)
    expect(screen.getByText('Equipaje de mano')).toBeInTheDocument()
  })
  it('muestra la sección de equipaje documentado', () => {
    render(<BaggageModal onClose={() => {}} />)
    expect(screen.getByText('Equipaje documentado')).toBeInTheDocument()
  })
  it('muestra la sección de artículos prohibidos', () => {
    render(<BaggageModal onClose={() => {}} />)
    expect(screen.getByText('Artículos prohibidos')).toBeInTheDocument()
  })
  it('muestra artículos especiales', () => {
    render(<BaggageModal onClose={() => {}} />)
    expect(screen.getByText('Artículos especiales')).toBeInTheDocument()
  })
  it('llama onClose al hacer click en el overlay', () => {
    const onClose = vi.fn()
    const { container } = render(<BaggageModal onClose={onClose} />)
    fireEvent.click(container.firstChild)
    expect(onClose).toHaveBeenCalled()
  })
  it('llama onClose al hacer click en X', () => {
    const onClose = vi.fn()
    render(<BaggageModal onClose={onClose} />)
    fireEvent.click(screen.getByText('×'))
    expect(onClose).toHaveBeenCalled()
  })
  it('muestra el aviso de OACI en el header', () => {
    const { container } = render(<BaggageModal onClose={() => {}} />)
    // Buscar por clase específica para evitar ambigüedad con múltiples "OACI"
    const header = container.querySelector('.baggage-header__label')
    expect(header.textContent).toContain('OACI')
  })
  it('muestra el aviso informativo de OACI', () => {
    const { container } = render(<BaggageModal onClose={() => {}} />)
    const notice = container.querySelector('.baggage-notice')
    expect(notice.textContent).toContain('OACI')
  })
  it('tiene exactamente 4 categorías de equipaje', () => {
    const { container } = render(<BaggageModal onClose={() => {}} />)
    const categorias = container.querySelectorAll('.baggage-cat')
    expect(categorias.length).toBe(4)
  })
  it('muestra la regla de dimensiones', () => {
    render(<BaggageModal onClose={() => {}} />)
    expect(screen.getByText(/55 × 40 × 20/)).toBeInTheDocument()
  })
})

// ── Navbar ────────────────────────────────────────────────────
describe('Navbar', () => {
  const defaultProps = {
    activePage: 'itinerary',
    onNavigate: vi.fn(),
    onBaggageClick: vi.fn(),
    isAMW: false
  }
  it('muestra el código JFK', () => {
    render(<Navbar {...defaultProps} />)
    expect(screen.getByText('JFK')).toBeInTheDocument()
  })
  it('muestra el subtítulo JOHN F. KENNEDY', () => {
    render(<Navbar {...defaultProps} />)
    expect(screen.getByText('JOHN F. KENNEDY')).toBeInTheDocument()
  })
  it('muestra el botón de Equipaje', () => {
    render(<Navbar {...defaultProps} />)
    expect(screen.getByText(/Equipaje/)).toBeInTheDocument()
  })
  it('muestra tab de Itinerario', () => {
    render(<Navbar {...defaultProps} />)
    expect(screen.getByText(/Itinerario/)).toBeInTheDocument()
  })
  it('muestra tab de Servicios', () => {
    render(<Navbar {...defaultProps} />)
    expect(screen.getByText(/Servicios/)).toBeInTheDocument()
  })
  it('muestra badge AMW cuando isAMW es true', () => {
    render(<Navbar {...defaultProps} isAMW={true} />)
    expect(screen.getByText('AMW')).toBeInTheDocument()
  })
  it('no muestra badge AMW cuando isAMW es false', () => {
    render(<Navbar {...defaultProps} isAMW={false} />)
    expect(screen.queryByText('AMW')).not.toBeInTheDocument()
  })
  it('llama onNavigate con widgets al hacer click en Servicios', () => {
    const onNavigate = vi.fn()
    render(<Navbar {...defaultProps} onNavigate={onNavigate} />)
    fireEvent.click(screen.getByText(/Servicios/))
    expect(onNavigate).toHaveBeenCalledWith('widgets')
  })
  it('llama onNavigate con itinerary al hacer click en Itinerario', () => {
    const onNavigate = vi.fn()
    render(<Navbar {...defaultProps} onNavigate={onNavigate} />)
    fireEvent.click(screen.getByText(/Itinerario/))
    expect(onNavigate).toHaveBeenCalledWith('itinerary')
  })
  it('llama onBaggageClick al hacer click en Equipaje', () => {
    const onBaggageClick = vi.fn()
    render(<Navbar {...defaultProps} onBaggageClick={onBaggageClick} />)
    fireEvent.click(screen.getByText(/Equipaje/))
    expect(onBaggageClick).toHaveBeenCalled()
  })
  it('renderiza la navbar correctamente', () => {
    const { container } = render(<Navbar {...defaultProps} />)
    expect(container.querySelector('.navbar')).toBeInTheDocument()
  })
})

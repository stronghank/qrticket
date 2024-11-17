import { useState, useRef, useEffect } from 'react'
import { Container, Row, Col, Form } from 'react-bootstrap'
import { QRCodeSVG } from 'qrcode.react'
import crud from '@/util/crud'
import logger from '@/util/logger'
import jwt from 'jsonwebtoken'

const Ticket = () => {
    const [eventCode, setEventCode] = useState('')
    const [tickets, setTickets] = useState(undefined)
    const [index, setIndex] = useState(-1)
    const [token, setToken] = useState(undefined)
    const qrCodeRef = useRef(null);

    setTimeout(() => {
        if (tickets) {
            let tempIndex = (index + 1) % tickets.length
            setIndex(tempIndex)
            jwt.sign({
                ticket_id: tickets[tempIndex].id,
                name: tickets[tempIndex].name,
                email: tickets[tempIndex].email,
                event_code: tickets[tempIndex].event_code,
            }, process.env.NEXT_PUBLIC_JWTSECRET, { algorithm: 'HS256' }, function (err, jsonwebtoken) {
                if (err) {
                    logger.error(`err: ${err}`)
                } else {
                    setToken(jsonwebtoken)
                }
            })
            logger.info(`index: ${tempIndex}`)
        }
    }, 3000)

    const handleEventCodeChange = (e) => {
        setEventCode(e.target.value)
    }

    useEffect(() => {
        Promise.all([crud({
            action: `R`,
            collection: `qrticket`,
            filter: {
                event_code: {
                    _eq: eventCode
                }
            }
        })])
            .then(r => {
                logger.info(`r: ${JSON.stringify(r, null, 2)}`)
                setTickets(r[0])
                if (r[0])
                    setIndex(0)
            })
    }, [eventCode])

    useEffect(() => {
        const downloadQRCode = (filename) => {
            const canvas = document.createElement('canvas');
            const svg = qrCodeRef.current.querySelector('svg');
            const svgData = new XMLSerializer().serializeToString(svg);

            const img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const dataUrl = canvas.toDataURL('image/png');

                const link = document.createElement('a');
                link.download = `${filename}.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        };

        if (token) {
            const currentTicket = tickets[index];
            const filename = `${currentTicket.id}_${currentTicket.name.replace(/\s+/g, '_')}`;
            downloadQRCode(filename);
        }
    }, [token, tickets, index]);

    return (
        <Container className="d-flex flex-column align-items-center mt-5">
            <h1 className="text-center">Ticket Slides</h1>
            <Row className="justify-content-md-center mt-4 w-100">
                <Col md={6} xs={12}>
                    <Form>
                        <Form.Group controlId="formBasicInput">
                            <Form.Label>Event Code</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Event Code"
                                value={eventCode}
                                onChange={handleEventCodeChange}
                            />
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
            <div className="text-center mt-4" ref={qrCodeRef}>
                <QRCodeSVG size={256} value={token} />
            </div>
        </Container>
    )
}

export default Ticket
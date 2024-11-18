import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import crud from '@/util/crud';
import logger from '@/util/logger';
import jwt from 'jsonwebtoken';
import { toPng } from 'html-to-image';

const Ticket = () => {
    const [eventCode, setEventCode] = useState('');
    const [tickets, setTickets] = useState(undefined);
    const [index, setIndex] = useState(-1);
    const [token, setToken] = useState(undefined);
    const qrCodeRef = useRef(null);
    const [stopTimeout, setStopTimeout] = useState(false);

    useEffect(() => {
        if (token) {
            downloadQRCode();
        }
    }, [token]);

    const downloadQRCode = () => {
        const svg = qrCodeRef.current.querySelector('svg');

        toPng(svg)
            .then((dataUrl) => {
                const link = document.createElement('a');
                const currentTicket = tickets[index];
                const filename = `${currentTicket.qrcode_id}_${currentTicket.name.replace(/\s+/g, '_')}_${eventCode}`;
                link.download = `${filename}.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) => {
                console.error('Error generating QR code image: ', error);
            });
    };

    const handleEventCodeChange = (e) => {
        setEventCode(e.target.value);
    };

    useEffect(() => {
        if (eventCode) {
            crud({
                action: 'R',
                collection: 'qrticket',
                filter: {
                    event_code: {
                        _eq: eventCode,
                    },
                },
            }).then((r) => {
                setTickets(r);
                setIndex(0);
                setStopTimeout(false);
            });
        }
    }, [eventCode]);

    useEffect(() => {
        if (tickets && index !== -1 && !stopTimeout) {
            const timeoutId = setTimeout(() => {
                let tempIndex = (index + 1) % tickets.length;
                setIndex(tempIndex);
                jwt.sign(
                    {
                        ticket_id: tickets[tempIndex].id,
                        name: tickets[tempIndex].name,
                        email: tickets[tempIndex].email,
                        event_code: tickets[tempIndex].event_code,
                    },
                    process.env.NEXT_PUBLIC_JWTSECRET,
                    { algorithm: 'HS256' },
                    function (err, jsonwebtoken) {
                        if (err) {
                            logger.error(`err: ${err}`);
                        } else {
                            setToken(jsonwebtoken);
                        }
                    }
                );

                if (tempIndex === 0 && stopTimeout) {
                    setStopTimeout(false); // Reset stopTimeout flag
                } else if (tempIndex === 0) {
                    setStopTimeout(true);
                }
            }, 3000);

            return () => clearTimeout(timeoutId);
        }
    }, [index, tickets, stopTimeout]);

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
    );
};

export default Ticket;

import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import crud from '@/util/crud';
import logger from '@/util/logger';
import jwt from 'jsonwebtoken';
import { toPng } from 'html-to-image';
import JSZip from 'jszip';

const Ticket = () => {
    const [eventCode, setEventCode] = useState('');
    const [tickets, setTickets] = useState(undefined);
    const [index, setIndex] = useState(-1);
    const [zip, setZip] = useState(new JSZip());
    const qrCodeRefs = useRef([]);

    const handleDownloadAll = () => {
        zip.generateAsync({ type: 'blob' }).then((content) => {
            const link = document.createElement('a');
            link.download = 'tickets.zip';
            link.href = URL.createObjectURL(content);
            link.click();
        });
    };

    useEffect(() => {
        if (tickets && index !== -1) {
            const currentTicket = tickets[index];
            const svg = qrCodeRefs.current[index].querySelector('svg');

            toPng(svg)
                .then((dataUrl) => {
                    const filename = `${currentTicket.qrcode_id}_${currentTicket.name.replace(/\s+/g, '_')}_${eventCode}.png`;
                    zip.file(filename, dataUrl.split('base64,')[1], { base64: true });

                    if (index === tickets.length - 1) {
                        handleDownloadAll();
                    } else {
                        setIndex(index + 1);
                    }
                })
                .catch((error) => {
                    console.error('Error generating QR code image: ', error);
                });
        }
    }, [tickets, index]);

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
            });
        }
    }, [eventCode]);

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
            <div className="text-center mt-4">
                {tickets &&
                    tickets.map((ticket, idx) => (
                        <div key={idx} ref={(ref) => (qrCodeRefs.current[idx] = ref)}>
                            <QRCodeSVG size={256} value={jwt.sign({ ticket_id: ticket.id }, process.env.NEXT_PUBLIC_JWTSECRET)} />
                        </div>
                    ))}
            </div>
        </Container>
    );
};

export default Ticket;
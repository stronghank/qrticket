import { Scanner } from '@yudiel/react-qr-scanner'
import React, { useState, useEffect } from 'react'
import styles from '@/pages/validator.css'
import logger from '@/util/logger'
import moment from 'moment'
import crud from '@/util/crud'
import { Table, Container, Row, Col, Form } from 'react-bootstrap'
import { FcApprove, FcDisapprove } from 'react-icons/fc'
import { IoScan } from "react-icons/io5"

const Validator = () => {
    const [isValid, setIsValid] = useState(undefined)
    const [currentMoment, setCurrentMoment] = useState(undefined)
    const [currentName, setCurrentName] = useState(undefined)
    const [currentEmail, setCurrentEmail] = useState(undefined)
    const [devices, setDevices] = useState([])
    const [selectedDeviceId, setSelectedDeviceId] = useState('')

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const mediaDevices = await navigator.mediaDevices.enumerateDevices()
                const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput')
                setDevices(videoDevices)
                if (videoDevices.length > 0) {
                    setSelectedDeviceId(videoDevices[0].deviceId) // Set default to the first camera
                }
            } catch (error) {
                console.error('Error fetching devices:', error)
            }
        }

        fetchDevices()
    }, [])

    const handleScan = (result) => {
        if (result) {
            const token = result[0].rawValue
            const now = moment()
            setCurrentMoment(now)
            logger.info(`token: ${token}`)
            Promise.all([crud({
                action: `C`,
                collection: `checkin`,
                data: {
                    checkin_datetime: now,
                },
                ticket_token: token,
            })])
                .then(r => {
                    logger.info(`r: ${JSON.stringify(r, null, 2)}`)
                    if (r[0] == null) {
                        setIsValid(false)
                        setCurrentEmail(undefined)
                        setCurrentName(undefined)
                    } else {
                        setIsValid(true)
                        setCurrentEmail(r[0]?.email)
                        setCurrentName(r[0]?.name)
                    }
                })
                .catch(error => {
                    logger.error(`error: ${JSON.stringify(error, null, 2)}`)
                    setIsValid(false)
                })
        }
    }

    useEffect(() => {
        logger.info(`isValid: ${isValid}`)
    }, [isValid])

    return (
        <Container className={styles.container}>
            <h1 className="text-center">QRTicket Validator</h1>
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Select Camera</Form.Label>
                        <Form.Select
                            onChange={(e) => setSelectedDeviceId(e.target.value)}
                            value={selectedDeviceId}
                        >
                            {devices.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Camera ${devices.indexOf(device) + 1}`}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Scanner
                        delay={300}
                        onScan={handleScan}
                        style={{ width: '100%' }}
                        allowMultiple={true}
                        facingMode={{ exact: selectedDeviceId }} // Use the selected device
                        components={{
                            audio: true,
                        }}
                    />
                </Col>
            </Row>
            <Row className="justify-content-center mt-4">
                <Col md={6}>
                    <Table striped bordered hover className="text-center">
                        <thead>
                            <tr>
                                <th>{isValid === undefined
                                    ? <IoScan size={90} />
                                    : (isValid === true
                                        ? <FcApprove size={90} />
                                        : <FcDisapprove size={90} />)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="table-text">{currentMoment?.format("HH:mm:ss YYYY/MM/DD")}</td>
                            </tr>
                            <tr>
                                <td className="table-text">{currentName}</td>
                            </tr>
                            <tr>
                                <td className="table-text">{currentEmail}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    )
}

export default Validator
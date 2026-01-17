

import { useEffect, useState, useRef } from "react";
import LoadingScreen from "../Loading/LoadingScreen";
import { CURRENT_ENV } from "../../utills/constants";
import axios from "axios";
import { InboxOutlined, ReloadOutlined } from '@ant-design/icons';
import { message, Upload, Button } from 'antd';
import { useSearchParams } from "react-router-dom";
import liff from '@line/liff';
const { Dragger } = Upload;

function MainScreen() {
    const [searchParams] = useSearchParams();
    const getId = searchParams.get("id") || "";
    const getAmount = searchParams.get("amount") || 0;

    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [name, setName] = useState(null);
    const [profileLine, setProfileLine] = useState(null);

    // useEffect(() => {
    //     liff.init({
    //         liffId: CURRENT_ENV.LIFF_ID
    //     })
    //         .then(async () => {
    //             if (liff.isLoggedIn()) {
    //                 if (liff.isLoggedIn()) {
    //                     liff
    //                         .getProfile()
    //                         .then((profile) => {
    //                             console.log(profile)
    //                             setProfileLine(profile);
    //                         })
    //                         .catch((_) => { });
    //                 } else {
    //                     liff.login();
    //                 }
    //             } else {
    //                 liff.login();
    //             }
    //         })
    //         .catch((_) => { });
    //     return () => { };
    // }, []);

    const props = {
        name: "file",
        multiple: false,
        beforeUpload: (file) => {
            setFile(file);
            return false;
        },
        accept: "image/*",
        showUploadList: false,
    };

    const handleCopy = async (accountNumber) => {
        try {
            await navigator.clipboard.writeText(accountNumber);
            alert(`คัดลอกเลขบัญชี ${accountNumber} เรียบร้อย`);
        } catch (err) {
            alert("ไม่สามารถคัดลอกได้");
        }
    };

    useEffect(() => {
        const getBankAccounts = async () => {
            try {
                const response = await axios.get(`${CURRENT_ENV.API_BASE_URL}?path=getBankAccounts&id=${getId}`);
                if (response.data.status === 200) {
                    console.log(response.data);
                    setBankAccounts(response.data.lists);
                    setName(response.data.shopName);
                }
            } catch (_) { }
            finally {
                setLoading(false)
            }
        };
        getBankAccounts();
    }, []);

    const confirmOrder = async () => {
        const base64 = await fileToBase64(file);
        try {
            const res = await fetch(
                CURRENT_ENV.API_BASE_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        filename: file.name,
                        mimetype: file.type,
                        file: base64,
                        amount: getAmount,
                        id: getId,
                    })
                }
            );

            const result = await res.json();
            console.log("API response:", result);

            if (result == 200) {
                alert(result.message);

                // liff.sendMessages([
                //     {
                //         type: 'flex',
                //         altText: `สวัสดีค่ะ ${response.data.shopName} ขอบคุณที่ใช้บริการ QR Promptpay System นะคะ 😊`,
                //         contents: {
                //             type: "bubble",
                //             body: {
                //                 type: "box",
                //                 layout: "vertical",
                //                 contents: [
                //                     {
                //                         type: "text",
                //                         text: `สวัสดีค่ะ ${response.data.shopName} ขอบคุณที่ใช้บริการ QR Promptpay System นะคะ 😊`,
                //                         weight: "bold"
                //                     }
                //                 ]
                //             }
                //         }
                //     }
                // ]).then(() => {
                //     console.log('Message sent');
                // }).catch((err) => {
                //     console.log('Error sending message: ' + err);
                // });
            } else {
                alert(result.message);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        }

    };

    const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
                resolve(reader.result.split(",")[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    return (
        <>
            {
                loading ?
                    <LoadingScreen />
                    : null
            }
            <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                padding: "30px 0 120px", // ⭐ เผื่อพื้นที่ปุ่มล่าง
                backgroundColor: "#f7f7f7",
                minHeight: "100vh",
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "80%",
                    backgroundColor: "white",
                    borderRadius: "20px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    padding: "0 20px",
                }}>
                    <div style={{}}>
                        <div style={{
                            width: `100%`,
                            padding: `12px 0`,
                            borderBottom: `2px solid #000000`,
                        }}>
                            <div style={{

                            }}>
                                <div>
                                    สรุป
                                </div>
                                <div style={{ fontWeight: `bold`, fontSize: `18px`, }}>
                                    ยอดรวม : {Number(getAmount).toLocaleString()} บาท
                                </div>
                                <div style={{}}>
                                    {name}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            width: `100%`,
                            padding: `12px 0`,
                            borderBottom: `2px solid #000000`,
                            fontSize: 16
                        }}>
                            <div style={{

                            }}>
                                <div>
                                    ข้อมูลการชำระเงิน
                                </div>
                                <div style={{ fontSize: 12 }}>
                                    สามารถคัดลอกหมายเลขบัญชีของผู้ขายจากรายการดังต่อไปนี้
                                </div>
                                <div>
                                    {bankAccounts.map((item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                paddingTop: "8px",
                                            }}
                                        >
                                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", flex: 8 }}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <img
                                                        src={item.logo}
                                                        alt={item.bankName}
                                                        style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                                                    />
                                                </div>

                                                <div
                                                    style={{
                                                        marginLeft: "12px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <div>{item.accountNumber}</div>
                                                    <div style={{ fontSize: "14px" }}>{item.bankName}</div>
                                                </div>
                                            </div>

                                            <div style={{ flex: 3 }}>
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <div
                                                        onClick={() => handleCopy(item.accountNumber)}
                                                        style={{
                                                            textAlign: "center",
                                                            padding: "5px 0",
                                                            userSelect: "none",
                                                            backgroundColor: "#4d8a96",
                                                            color: "#ffffff",
                                                            borderRadius: "20px",
                                                            cursor: "pointer",
                                                            width: "100px",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        คัดลอก
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </div>

                        <div style={{
                            width: `100%`,
                            padding: `12px 0`,
                        }}>
                            <div style={{

                            }}>
                                <div>
                                    แนบสลิป
                                </div>
                                <div style={{ fontSize: 12 }}>
                                    เพิ่มรูปภาพของสลิปเพื่อให้ระบบตรวจสอบการชำระเงินของคุณ
                                </div>

                                <div style={{ marginTop: `8px`, }}>
                                    {!file ? (
                                        <Dragger {...props}>
                                            <p className="ant-upload-drag-icon">
                                                <InboxOutlined />
                                            </p>
                                            <p className="ant-upload-text">แนบสลิป</p>
                                            <p className="ant-upload-hint">
                                                เพิ่มรูปภาพของสลิปเพื่อให้ระบบตรวจสอบการชำระเงินของคุณ
                                            </p>
                                        </Dragger>
                                    ) : (
                                        <div style={{ textAlign: "center" }}>
                                            <Upload {...props}>
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="slip"
                                                    style={{
                                                        maxWidth: "100%",
                                                        borderRadius: 8,
                                                        border: "1px solid #d9d9d9",
                                                    }}
                                                />
                                            </Upload>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "60px",
                    backgroundColor: "#ffffff",
                    padding: "20px 0",
                    boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
                }}>
                    <div>
                        {
                            file ? (
                                <div onClick={confirmOrder} style={{ display: `flex`, justifyContent: `center` }}>
                                    <div style={{ width: `80%`, padding: `10px 20px`, backgroundColor: `#4d8a96`, color: `#ffffff`, border: `none`, borderRadius: `5px`, cursor: `pointer`, borderRadius: `10px`, textAlign: `center` }}>
                                        ยืนยันการชำระเงิน
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: `flex`, justifyContent: `center` }}>
                                    <div style={{ width: `80%`, padding: `10px 20px`, backgroundColor: `grey`, color: `#ffffff`, border: `none`, borderRadius: `5px`, borderRadius: `10px`, textAlign: `center` }}>
                                        ยืนยันการชำระเงิน
                                    </div>
                                </div>
                            )
                        }

                    </div>
                </div>
            </div>
        </>
    );
}

export default MainScreen;

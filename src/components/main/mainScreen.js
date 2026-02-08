

import { useEffect, useState } from "react";
import LoadingScreen from "../Loading/LoadingScreen";
import { CURRENT_ENV } from "../../utills/constants";
import axios from "axios";
import { InboxOutlined } from '@ant-design/icons';
import { Upload, message, Result } from 'antd';
import { useSearchParams } from "react-router-dom";
import liff from "@line/liff";

const { Dragger } = Upload;

function MainScreen() {
    const [searchParams] = useSearchParams();
    const [messageApi, contextHolder] = message.useMessage();

    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [shopName, setShopName] = useState(null);
    const [isActive, setIsActive] = useState(null);

    const [getId, setOrderId] = useState(searchParams.get("id") || "");
    const [getAmount, setAmount] = useState(searchParams.get("amount") || 0);

    useEffect(() => {
        const initLiff = async () => {
            try {
                await liff.init({ liffId: CURRENT_ENV.LIFF_ID });
                await liff.ready;

                if (!liff.isLoggedIn()) {
                    liff.login();
                    return;
                }

                if (!liff.isInClient()) {
                    error("กรุณาเปิดหน้านี้ผ่าน LINE เท่านั้น");
                    setIsActive(403)
                    setLoading(false)
                    return
                }

                let id = "";
                let amount = 0;

                if (liff.isInClient() && liff.state) {
                    const params = new URLSearchParams(liff.state);
                    id = params.get("id") || "";
                    amount = Number(params.get("amount") || 0);
                } else {
                    const params = new URLSearchParams(window.location.search);
                    id = params.get("id") || "";
                    amount = Number(params.get("amount") || 0);
                }

                setOrderId(id);
                setAmount(amount);

            } catch (err) {
                console.error("LIFF init error", err);
                error("ไม่สามารถเปิด LIFF ได้");
            }
        };

        initLiff();
    }, []);

    const success = (text) => {
        messageApi.open({
            type: 'success',
            content: text,
        });
    };

    const error = (text) => {
        messageApi.open({
            type: 'error',
            content: text,
        });
    };

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

    const handleCopy = (accountNumber) => {
        try {
            if (!navigator.clipboard) {
                error("อุปกรณ์ไม่รองรับการคัดลอกอัตโนมัติ");
                return;
            }
            navigator.clipboard.writeText(accountNumber);
            success(`คัดลอก ${accountNumber} เรียบร้อย ✅`);
        } catch (e) {
            error("ไม่สามารถคัดลอกได้");
        }
    };

    useEffect(() => {
        const getBankAccounts = async () => {
            try {
                if (getId) {
                    const response = await axios.get(`${CURRENT_ENV.API_BASE_URL}?path=getBankAccounts&id=${getId}&uid=${liff.getContext().userId || ""}`);
                    if (response.data.status === 200) {
                        setBankAccounts(response.data.lists);
                        setShopName(response.data.shopName);
                        setIsActive(response.data.isActive);
                        setLoading(false)
                    } else {
                        setLoading(false)
                        error(response.data.message);
                    }
                }
                return;
            } catch (_) { }
            finally {
            }
        };
        getBankAccounts();

    }, [getId]);

    const confirmOrder = async () => {
        if (!file) {
            error("กรุณาแนบสลิปก่อน");
            return;
        }
        setLoading(true);
        const base64 = await fileToBase64(file);
        try {
            const res = await fetch(
                CURRENT_ENV.API_BASE_URL,
                {
                    method: "POST",
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

            if (result.status === 200) {
                if (liff.isInClient()) {
                    liff.sendMessages([
                        {
                            type: 'flex',
                            altText: `ผลระบบตรวจสอบสลิป`,
                            contents: {
                                "type": "bubble",
                                "direction": "ltr",
                                "header": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "paddingBottom": "10px",
                                    "backgroundColor": "#509C40FF",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": `${result.message}`,
                                            "weight": "bold",
                                            "size": "xl",
                                            "color": "#FFFFFFFF",
                                            "align": "center",
                                            "contents": []
                                        }
                                    ]
                                },
                                "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "paddingAll": "0px",
                                    "borderWidth": "10px",
                                    "backgroundColor": "#509C40FF",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "paddingAll": "10px",
                                                    "backgroundColor": "#FFFFFFFF",
                                                    "cornerRadius": "8px",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "จำนวนเงิน",
                                                            "size": "xs",
                                                            "color": "#9E9E9EFF",
                                                            "align": "center",
                                                            "gravity": "center",
                                                            "contents": []
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": `${result.amount.toLocaleString()}`,
                                                            "weight": "bold",
                                                            "size": "3xl",
                                                            "color": "#509C40FF",
                                                            "align": "center",
                                                            "contents": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                "footer": {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "backgroundColor": "#000000FF",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "Developer By Punnathat.k",
                                                    "weight": "bold",
                                                    "size": "xs",
                                                    "color": "#FFFFFFFF",
                                                    "flex": 10,
                                                    "align": "center",
                                                    "contents": []
                                                }
                                            ]
                                        }
                                    ],
                                    "action": {
                                        "type": "uri",
                                        "label": "action",
                                        "uri": "https://fastwork.co/user/punnathat/chatbot-42013422?source=seller-center_my-service_share-link"
                                    }
                                }
                            }
                        }
                    ]).then(() => {
                        setLoading(false);
                        success(`✅ ส่งผลตรวจสอบสลิปไปทางช่องแชทเรียบร้อยแล้ว`);
                        liff.closeWindow();
                    }).catch((err) => {
                        console.log('Error sending message: ' + err);
                        error('❌ ไม่สามารถส่งข้อความได้ Error: ' + err);
                    });
                }

            } else {
                if (liff.isInClient()) {
                    liff.sendMessages([
                        {
                            type: 'flex',
                            altText: `ผลระบบตรวจสอบสลิป`,
                            contents: {
                                "type": "bubble",
                                "direction": "ltr",
                                "header": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "paddingBottom": "10px",
                                    "backgroundColor": "#AA3B3BFF",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": `${result.message}`,
                                            "weight": "bold",
                                            "size": "xl",
                                            "color": "#FFFFFFFF",
                                            "align": "center",
                                            "contents": []
                                        }
                                    ]
                                },
                                "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "paddingAll": "0px",
                                    "borderWidth": "10px",
                                    "backgroundColor": "#AA3B3BFF",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "box",
                                                    "layout": "vertical",
                                                    "paddingAll": "10px",
                                                    "backgroundColor": "#FFFFFFFF",
                                                    "cornerRadius": "8px",
                                                    "contents": [
                                                        {
                                                            "type": "text",
                                                            "text": "จำนวนเงิน",
                                                            "size": "xs",
                                                            "color": "#9E9E9EFF",
                                                            "align": "center",
                                                            "gravity": "center",
                                                            "contents": []
                                                        },
                                                        {
                                                            "type": "text",
                                                            "text": `${result.amount.toLocaleString()}`,
                                                            "weight": "bold",
                                                            "size": "3xl",
                                                            "color": "#AA3B3BFF",
                                                            "align": "center",
                                                            "contents": []
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                "footer": {
                                    "type": "box",
                                    "layout": "horizontal",
                                    "backgroundColor": "#000000FF",
                                    "contents": [
                                        {
                                            "type": "box",
                                            "layout": "horizontal",
                                            "contents": [
                                                {
                                                    "type": "text",
                                                    "text": "Developer By Punnathat.k",
                                                    "weight": "bold",
                                                    "size": "xs",
                                                    "color": "#FFFFFFFF",
                                                    "flex": 10,
                                                    "align": "center",
                                                    "contents": []
                                                }
                                            ]
                                        }
                                    ],
                                    "action": {
                                        "type": "uri",
                                        "label": "action",
                                        "uri": "https://fastwork.co/user/punnathat/chatbot-42013422?source=seller-center_my-service_share-link"
                                    }
                                }
                            }
                        }
                    ]).then(() => {
                        setLoading(false);
                        success(`✅ ส่งผลตรวจสอบสลิปไปทางช่องแชทเรียบร้อยแล้ว`);
                        liff.closeWindow();
                    }).catch((err) => {
                        console.log('Error sending message: ' + err);
                        error('❌ ไม่สามารถส่งข้อความได้ Error: ' + err);
                    });
                }
            }
        } catch (err) {
            error(`Error: ${err.message}`);
        } finally {
            // setLoading(false);
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
            {contextHolder}
            {
                loading ?
                    <LoadingScreen />
                    : null
            }
            {
                isActive === true ? (
                    <>
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
                                borderTop: `7px solid #4d8a96`,
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
                                                {shopName}
                                            </div>
                                        </div>
                                    </div>


                                    {
                                        bankAccounts.length > 0 &&
                                        <div style={{
                                            width: `100%`,
                                            padding: `12px 0`,
                                            borderBottom: `2px solid #000000`,
                                            fontSize: 16
                                        }}>
                                            <div style={{}}>
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
                                    }



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
                                borderTop: `7px solid #4d8a96`,
                                borderRadius: 20
                            }}>
                                <div>
                                    {
                                        file && getAmount ? (
                                            <div onClick={confirmOrder} style={{ display: `flex`, justifyContent: `center` }}>
                                                <div style={{ width: `80%`, padding: `10px 20px`, backgroundColor: `#4d8a96`, color: `#ffffff`, border: `none`, cursor: `pointer`, borderRadius: `10px`, textAlign: `center` }}>
                                                    ยืนยันการชำระเงิน
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: `flex`, justifyContent: `center` }}>
                                                <div style={{ width: `80%`, padding: `10px 20px`, backgroundColor: `grey`, color: `#ffffff`, border: `none`, borderRadius: `10px`, textAlign: `center` }}>
                                                    ยืนยันการชำระเงิน
                                                </div>
                                            </div>
                                        )
                                    }

                                </div>
                            </div>
                        </div>
                    </>
                ) :
                    isActive === false ? (
                        <>
                            <div style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#f7f7f7",
                                minHeight: "100vh",
                            }}>
                                <Result
                                    status="403"
                                    title="403"
                                    subTitle="ขออภัย ไม่สามารถใช้งานระบบได้ อาจเป็นไปได้ว่าระบบถูกยกเลิกหรือหมดอายุแล้ว กรุณาติดต่อแอดมิน"
                                />
                            </div>
                        </>
                    ) : isActive === 403 ? (
                        <>
                            <div style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#f7f7f7",
                                minHeight: "100vh",
                            }}>
                                <Result
                                    status="403"
                                    title="403"
                                    subTitle="ขออภัย กรุณาเปิดหน้านี้ผ่าน LINE เท่านั้น"
                                />
                            </div>
                        </>
                    ) : null

            }

        </>
    );
}

export default MainScreen;

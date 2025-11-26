import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton, Button } from '@mui/material';
import "../styles/history.css";

export default function History() {

    const { getHistoryOfUser, deleteHistoryItem } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);

    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();

                const fixedHistory = history.map(m => ({
                    ...m,
                    meetingCode: m.meetingCode || m.meeting_code
                }));

                setMeetings(fixedHistory);

            } catch (err) {
                console.log("History fetch error:", err);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${date.getFullYear()}`;
    };

    const handleDelete = async (id) => {
        const res = await deleteHistoryItem(id);

        if (res.success) {
            setMeetings(prev => prev.filter(m => m._id !== id));
        }
    };

    return (
        <div className="historyContainer">

            <div className="historyHeader">
                <IconButton className="homeBtn" onClick={() => routeTo("/home")}>
                    <HomeIcon />
                </IconButton>

                <h2 className="historyTitle">Meeting History</h2>
            </div>

            <div className="historyList">
                {meetings.length !== 0 ? (
                    meetings.map((e) => (
                        <Card key={e._id} className="historyCard" variant="outlined">
                            <CardContent>
                                <Typography className="historyCode">
                                    Code: {e.meetingCode}
                                </Typography>

                                <Typography className="historyDate">
                                    Date: {formatDate(e.date)}
                                </Typography>

                                <Button
                                    variant="contained"
                                    color="error"
                                    className="deleteBtn"
                                    onClick={() => handleDelete(e._id)}
                                >
                                    DELETE
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography className="noHistory">
                        No History Found
                    </Typography>
                )}
            </div>

        </div>
    );
}

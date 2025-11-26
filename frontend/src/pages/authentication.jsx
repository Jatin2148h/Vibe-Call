import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import "../styles/authPage.css";

const defaultTheme = createTheme();

export default function Authentication() {

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [formState, setFormState] = React.useState(0);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    const handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            } else {
                let result = await handleRegister(name, username, password);
                setMessage(result);
                setOpen(true);
                setUsername("");
                setPassword("");
                setName("");
                setError("");
                setFormState(0);
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />

            <div className="authContainer">

                <div className="glassCard fadeIn">

                    <Avatar className="authIcon">
                        <LockOutlinedIcon />
                    </Avatar>

                    <div className="toggleButtons">
                        <button
                            className={formState === 0 ? "activeBtn" : ""}
                            onClick={() => setFormState(0)}
                        >
                            Sign In
                        </button>

                        <button
                            className={formState === 1 ? "activeBtn" : ""}
                            onClick={() => setFormState(1)}
                        >
                            Sign Up
                        </button>
                    </div>

                    <Box component="form" noValidate className="formBox">

                        {formState === 1 && (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        )}

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            type="password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <p className="errorText">{error}</p>

                        <Button
                            fullWidth
                            variant="contained"
                            className="submitBtn"
                            onClick={handleAuth}
                        >
                            {formState === 0 ? "Login" : "Register"}
                        </Button>

                    </Box>
                </div>

            </div>

            <Snackbar open={open} autoHideDuration={4000} message={message} />
        </ThemeProvider>
    );
}

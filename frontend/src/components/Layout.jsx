//frontend/src/components/Layout.jsx
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Breadcrumbs, Typography, Box, Container, Drawer, AppBar, Toolbar, List, ListItem, ListItemText, CssBaseline } from "@mui/material";
import { Home as HomeIcon, AccountCircle as AccountIcon, School as SchoolIcon, AdminPanelSettings as AdminIcon, Business as InstituteIcon } from '@mui/icons-material';

const Layout = ({ children, pageTitle }) => {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <List>
                    <ListItem button component={Link} to="/student/dashboard">
                        <SchoolIcon />
                        <ListItemText primary="Student Dashboard" />
                    </ListItem>
                    <ListItem button component={Link} to="/teacher/dashboard">
                        <AccountIcon />
                        <ListItemText primary="Teacher Dashboard" />
                    </ListItem>
                    <ListItem button component={Link} to="/admin/dashboard">
                        <AdminIcon />
                        <ListItemText primary="Admin Dashboard" />
                    </ListItem>
                    <ListItem button component={Link} to="/institute/dashboard">
                        <InstituteIcon />
                        <ListItemText primary="Institute Dashboard" />
                    </ListItem>
                </List>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: 'background.default', padding: 3 }}
            >
                {/* Top Bar */}
                <AppBar position="sticky">
                    <Toolbar>
                        <Typography variant="h6">Dashboard - {pageTitle}</Typography>
                    </Toolbar>
                </AppBar>

                {/* Breadcrumbs */}
                <Breadcrumbs aria-label="breadcrumb" sx={{ marginTop: 2 }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <HomeIcon /> Home
                    </Link>
                    <Typography color="text.primary">{pageTitle}</Typography>
                </Breadcrumbs>

                {/* Main content area */}
                <Container maxWidth="lg" sx={{ marginTop: 3 }}>
                    {children}
                </Container>
            </Box>
        </Box>
    );
};

// Define PropTypes
Layout.propTypes = {
    children: PropTypes.node.isRequired, // children should be a valid React node
    pageTitle: PropTypes.string.isRequired, // pageTitle should be a string
};

// Export the Layout component
export default Layout;

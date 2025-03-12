import { AppBar, Toolbar, Typography, Box, Container, Button } from '@mui/material';
import Link from 'next/link';
import ParsecLogo from './ParsecLogo';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export default function Header() {
    return (
        <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ height: 64 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <Link href="/" passHref style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <ParsecLogo sx={{ mr: 1 }} />
                            <Typography
                                variant="h6"
                                noWrap
                                component="div"
                                sx={{ fontWeight: 700, letterSpacing: '-0.01em', color: 'text.primary' }}
                            >
                                Parsec
                            </Typography>
                        </Link>
                    </Box>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        component={Link}
                        href="/how-to-use"
                        color="inherit"
                        startIcon={<MenuBookIcon />}
                        sx={{ textTransform: 'none' }}
                    >
                        How to Use
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
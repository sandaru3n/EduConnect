//frontend/src/features/home/PricingPage.jsx
import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import {
  AppBar, Toolbar, Container, Grid, Card, CardContent, Typography, Button,
  Box, CssBaseline, Chip, Divider, useMediaQuery
} from "@mui/material";
import {
  School, People, Storage, Support, CheckCircle, Star
} from "@mui/icons-material";
import { fetchSubscriptions } from "/src/services/api";

const FeatureItem = ({ icon, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
    {icon}
    <Typography variant="body1" sx={{ ml: 1.5 }}>{text}</Typography>
  </Box>
);

FeatureItem.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired
};

const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await fetchSubscriptions();
      const activePlans = data.filter(plan => plan.status === "Active");
      setPlans(activePlans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
    }
  };

  return (
    <>
      <CssBaseline />
      
      {/* Modern Navbar */}
      <AppBar position="sticky" sx={{ 
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: "white",
        boxShadow: 1,
      }}>
        <Toolbar sx={{ 
          display: "flex", 
          justifyContent: "space-between",
          maxWidth: 'lg',
          mx: 'auto',
          width: '100%',
          px: isMobile ? 2 : 4
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <School sx={{ fontSize: 32 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              EduPlatform
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" href="/" sx={{ fontWeight: 600 }}>Home</Button>
            <Button color="inherit" href="/support" sx={{ fontWeight: 600 }}>Support</Button>
            <Button 
              color="inherit" 
              variant="outlined"
              href="/login"
              sx={{ 
                borderRadius: 50,
                px: 3,
                textTransform: 'none',
                borderWidth: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Get Started
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Pricing Section */}
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Chip 
              label="Flexible Plans" 
              color="primary" 
              sx={{ 
                mb: 2,
                px: 2,
                py: 1,
                fontWeight: 600,
                background: 'rgba(33, 150, 243, 0.1)'
              }} 
            />
            <Typography variant="h2" sx={{ 
              fontWeight: 800,
              mb: 2,
              fontSize: isMobile ? '2.5rem' : '3.5rem'
            }}>
              Simple, transparent pricing
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Start for free, then upgrade when youre ready. Cancel anytime.
            </Typography>
          </Box>

          {/* Pricing Cards */}
          <Grid container spacing={4} justifyContent="center">
            {plans.map((plan) => (
              <Grid item key={plan._id} xs={12} sm={6} lg={4}>
                <Card sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": { 
                    transform: "translateY(-8px)",
                    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.1)'
                  },
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}>
                  {plan.recommended && (
                    <Box sx={{
                      position: 'absolute',
                      top: -16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      px: 3,
                      py: 0.5,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: 50,
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Star sx={{ fontSize: 16, mr: 1 }} />
                      Most Popular
                    </Box>
                  )}

                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700,
                      mb: 2,
                      color: plan.recommended ? 'primary.main' : 'text.primary'
                    }}>
                      {plan.plan}
                    </Typography>
                    
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h3" sx={{ fontWeight: 800 }}>
                        ${parseFloat(plan.price).toFixed(2)}
                        <Typography component="span" variant="body1" sx={{ 
                          ml: 1,
                          color: 'text.secondary'
                        }}>
                          /month
                        </Typography>
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ mb: 4 }}>
                      <FeatureItem icon={<People fontSize="small" />} text={`${plan.studentLimit} Students`} />
                      <FeatureItem icon={<School fontSize="small" />} text={`${plan.teacherAccounts} Teachers`} />
                      <FeatureItem icon={<Storage fontSize="small" />} text={plan.storage} />
                      <FeatureItem icon={<Support fontSize="small" />} text={plan.support} />
                    </Box>

                    <Button
                      fullWidth
                      variant={plan.recommended ? "contained" : "outlined"}
                      size="large"
                      sx={{
                        borderRadius: 50,
                        py: 2,
                        fontWeight: 700,
                        textTransform: 'none',
                        ...(plan.recommended && {
                          background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                          '&:hover': { boxShadow: '0 8px 24px rgba(33, 150, 243, 0.4)' }
                        })
                      }}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Trust Badges */}
          <Box sx={{ 
            mt: 8,
            textAlign: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 4,
            opacity: 0.8
          }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              30-day money back guarantee
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              Secure SSL encryption
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default PricingPage;
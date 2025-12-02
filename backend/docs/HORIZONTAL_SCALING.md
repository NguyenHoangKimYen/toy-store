# Horizontal Scaling - Proof & Evidence Guide

## Overview

MilkyBloom is designed for **horizontal scaling** - the ability to handle more traffic by adding more server instances behind a load balancer.

---

## Architecture (Stateless Design)

| Component | Storage Type | Scaling Ready |
|-----------|--------------|---------------|
| Authentication | JWT tokens (stateless) | ✅ |
| Database | MongoDB Atlas (external) | ✅ |
| Images | Cloudinary/S3 (external) | ✅ |
| Sessions | Short-lived (OAuth only, 5 min) | ✅ |
| WebSocket | Sticky sessions on ALB | ✅ |

---

## Proof 1: Instance ID in Every Response

Every API response includes an `X-Instance-ID` header showing which server handled the request.

**Test locally:**
```bash
curl -I http://localhost:5000/api/products
# Look for: X-Instance-ID: hostname-abc12345
```

**Test on production:**
```bash
curl -I https://api.milkybloomtoystore.id.vn/api/products
```

---

## Proof 2: Health Check Endpoint

AWS Load Balancer uses this to check instance health.

**Request:**
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "instance": "ip-172-31-45-123-a1b2c3d4",
  "uptime": 3600.5,
  "timestamp": "2025-12-03T10:00:00.000Z"
}
```

---

## Proof 3: Root Endpoint Shows Scaling Status

```
GET /
```

**Response:**
```json
{
  "message": "MilkyBloom backend is running on AWS 🚀",
  "instance": "ip-172-31-45-123-a1b2c3d4",
  "scalingReady": true
}
```

---

## Proof 4: Multiple Instances Show Different IDs

When running 2+ instances behind AWS ALB, repeated requests show different instance IDs:

```bash
# Run multiple times
curl https://api.milkybloomtoystore.id.vn/health

# Response 1: {"instance": "ip-172-31-45-123-a1b2c3d4", ...}
# Response 2: {"instance": "ip-172-31-67-89-e5f6g7h8", ...}
# Response 3: {"instance": "ip-172-31-45-123-a1b2c3d4", ...}
```

---

## AWS Elastic Beanstalk Setup

### 1. Scale to Multiple Instances

```
EB Console → Environment → Configuration → Capacity
├── Min instances: 2
├── Max instances: 4
└── Scaling trigger: CPU > 70%
```

### 2. Verify Load Balancer

```
EC2 Console → Load Balancers → Your ALB
├── Health check path: /health
├── Registered targets: 2+ instances
└── All instances: Healthy ✅
```

### 3. Enable Sticky Sessions (for WebSocket)

```
EC2 Console → Target Groups → Your TG → Attributes
└── Stickiness: Enabled (1 day)
```

---

## Screenshots to Capture

1. **EB Environment** - Show 2+ instances running
2. **EC2 Instances** - List showing multiple instance IDs
3. **Load Balancer** - Target group with healthy instances
4. **Terminal** - Multiple `/health` calls showing different instance IDs
5. **Browser DevTools** - `X-Instance-ID` header in Network tab

---

## Code References

| File | Feature |
|------|---------|
| `server.js` lines 20-30 | Instance ID generation |
| `server.js` lines 183-190 | Health check endpoint |
| `socket/index.js` lines 1-18 | Socket.IO scaling notes |

---

## Summary

✅ **Stateless API** - JWT auth, no server-side sessions  
✅ **External Database** - MongoDB Atlas shared across instances  
✅ **External Storage** - Cloudinary/S3 for images  
✅ **Instance Tracking** - Unique ID per server instance  
✅ **Health Checks** - ALB can monitor instance health  
✅ **Load Balanced** - Requests distributed across instances

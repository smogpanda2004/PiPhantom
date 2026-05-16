# **PiPhantom: Device-Free Physical Intrusion Detection 🌌**

**PiPhantom** is a cutting-edge, completely offline intrusion detection and 2D spatial tracking system. By repurposing ambient 2.4GHz Wi-Fi signals as a high-fidelity spatial sensor, it creates an invisible electromagnetic tripwire capable of detecting human presence through walls and in total darkness.

## **🚀 Executive Summary**

PiPhantom provides a robust alternative to traditional security systems like optical cameras (which violate privacy) and PIR sensors (which fail to detect stationary subjects). By monitoring **Channel State Information (CSI)**—fine-grained physical layer data—the system detects minute fluctuations caused by the human body's water mass. These disruptions are processed at the "Edge" using machine learning to provide real-time spatial awareness without ever recording audio or video, ensuring 100% data sovereignty and privacy.

## **🛠️ Technical Architecture**

The system utilizes a three-tiered edge-computing pipeline engineered for zero-latency performance:

1. **Sensing Layer (ESP32 Nodes):** Distributed microcontrollers extract raw CSI subcarrier matrices and broadcast telemetry via high-speed UDP.  
2. **Edge-AI Layer (Raspberry Pi 5):** A centralized Python engine calculates rolling statistical variance (![][image1]) and runs an unsupervised **Isolation Forest** model to differentiate human movement from environmental noise.  
3. **Visualization Layer (React Dashboard):** A hardware-accelerated, high-DPI "Glassmorphism" interface that renders live coordinates and tracking "heat" blobs at 60 FPS.

**📊 Key Performance Metrics**

Validated inside a ![][image2] high-noise server environment:

| Activity Vector | Accuracy | Precision | F1-Score |
| :---- | :---- | :---- | :---- |
| **Dynamic Movement (Walking)** | **99.2%** | 0.96 | 0.97 |
| **Stationary Posture (Standing)** | **87.3%** | 0.82 | 0.84 |
| **Stationary Posture (Sitting)** | **72.1%** | 0.68 | 0.70 |

* **System Latency:** \~35ms end-to-end.  
* **Reliable Range:** 2.5-meter radius per node (expandable via mesh).

## **🔒 Core Value Propositions**

* **Privacy-First:** No cameras or microphones; only abstract mathematical signal variance is processed.  
* **Air-Gapped Security:** Operates 100% locally. No cloud dependencies or internet access required.  
* **Non-Line-of-Sight (NLoS):** Detects intrusions through standard drywall and wooden partitions.

## **🗺️ Future Roadmap**

* **IoT Mesh Networking:** Transitioning to a self-healing mesh to provide seamless coverage for large-scale industrial warehouses.  
* **SDR Passive Radar:** Integrating RTL-SDR receivers to monitor a wider frequency spectrum for extreme-range stationary detection.  
* **Deep Learning Classification:** Implementing CNN/LSTM models for gesture recognition and fall-detection alerts.

*PiPhantom is an open-source initiative promoting localized infrastructure privacy and advanced RF telemetry.*

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAZCAYAAADTyxWqAAACE0lEQVR4Xq1VO0gDQRC9oIKiqBjPEO9u5/YujaAgBAVBO5sUqaytBbFWEHvBylax1dZWJIWFpSCCha0gdjYWNiLx7f2ye7OHjROSnX0z8+bNXjZxnMJqeJUsAXQ0y7EkalDmmsvAdLzmDBGJLUF0TkSHrVZrUs8p9S6ZSeSEYbhDQqxjB1I6wvvem/fqSdBebI6T57iuO4HiOxJ0oVAhRIT9O5R2jExbsU2z7/tLUkpSPogWFBlIN4tUpk43S5c8HyQHMgxvleISC5OVmZ1IynAVqq6gdCaDcrMQWaAcwENYxkM4bjQa44osiuM5PV5UtdvtESllA4faROcmDrupfBBMqzhigOgkiiORxsV2EAQrBZky1QVncIqEHxT3kdlHVV/5lPo9z/Pq8K+TPd5JDtEbcD/Vgs8oiqcA9lDwGAT+huoO/xIfH8DXlDrXnZ0YTGA5j3xHqaLnGLPnISGoDewTRB1rMTvM1P6PjNIvHsYRewaOKwP8G+fY1XHdWAtBoguir/ITSe4gzgyHvGCIYYo0AON0UfAKFc08gO/OGPAb4LiDznCRnLHppEYDKFoE0YtaM6iG0fZB9CSTO6gXM1kMqmGcXRQ/UPIbJe4w4ll6TdiplBfDK7YgGFWjqpUFBwvzDatKYgWWMSvVVZmFY2BZ0Aj/3aFKc9UfTG4skAHmYgPKGw6xzgwwIFsHDjFFzHecXzTGWw+Q1rejAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAAAXCAYAAABDArJmAAAEt0lEQVR4Xr1XP4gUVxzewbMQPRTk3Hi3O29297hVSZBko1amkoCFELyLGGJhkcLCRuGQXEgVAiYkIMZKBVERjI1FLCwshAMDV9mlSqFcFBRTJYEchMv3vXlv5s37MzO7t/jBc2a+35/3+33vz56NqAHIf8aMUM4xTDiGFLUx5DQV7qbZcXWIjXXqCfNQORxjkSgtxWcM+b4VlE5eavQ3UwPDR4yMIabyuPr7c4gxIApkLbKOj0MoaD6352/dbm97HMc3Wq3WexkpUSzCn9vPEtWxFRgyKEmST4QQ39v8aPBPHmGSLzHJ3xBsYBslVFwgPMAPixGzqDD0kKCH3/G46RgdhGr2sxmQ/BAm+bNUrDpw5nEIBQ/voWoDsYPBYDPqvy5isZ6JNWJON0wx3W53Oya5hnE13qhYNTE9Pd1mc/rbLq7ZbG6dmZnZadEZcn/1hgfq/hQ9/IixWtxZCvYkQYQdIyQ/jzGPyS5YYm3q9Xq72u32u7AfxV22pdPpNGE/hudHulk2Bp+POSi8kTsI5DiFcWnwQS6YBhp9B7vjPuY4aNtCSDry+F1F7B48n5liTU1NbYPwLdYH217WjfcPebdx0ZRbhNrnUNOCEPFefG/S8RlYEFeDCeJYFMTC/DtQxD0E/6dW6zu8f4PnSTTzBO+P8P4ZbLfJsUC8v0bO/fY8GsaacZHOYvxk7jAplCgRyrPo6vj9oK6S3bZYSdLhhf8HxjoFZb0Yn2N8xX7x/ELx5xF3Bn3R9wpCJ7JJ1PHjaiT85s4SFEsUjyG4JTXRWYM7Tg6h93SziO+Ce8k8ebS3P40IokOwWApWECo/XZVAzDwbhTcXwBGL4M4Cv4rxG08HE/f7c5P4XkYN/2KnHTbyfcsczCUJ+EZIeI7nXDtlYll3luLfICm3p+aOUSyM4ykTcRJZqC1WDu+vj9xhFB3PX7IdZTp6gjTgjzBxTR//mDXErli6NozLmuPxxPdj+C/3+/1Jzat+c7Hw8r5Qx8908l3wis+DU06KxWfKFMUq6U8h9+C9gbinGLfMempgAnNd5PHThK7BK1ZcXEhDrMd817wjFs8myOfmwHH4iwIg+BWey7zc2RPvMhkcG2IJW6y80EwsRzGHkMcD/g/ZcNJJTgvrDjPz5NHpW6/b28U6iz2IF7IHIdb4zT7thdRZMrFEhVg+KCfPzlJile6soliaC5+nKBMqO3og0dzp2BIsCFf7wM6K0uNp1hYFxJKbo0QsPadIL/J/cNkdMO2KX2VzmguKFRfvhRDUhfuAP+GWKeok7g6TBvMjAOMiv9MwQgx+SXNesRrGHS14R1uzwngEBh69dTX4p8KT2dnZfVihlYyPxRqei+B+Vj7SV30vYqTHOP2VXJHHOAD4fO0IlR+3CDUtYJzwGX3g33rwv4u8rDGtF/8j4THkMHnWBt9TtJu+ivvV4NbSYzwyAtUG+RFRmq54nKtR4VNqLjVqeH/mHZSW7RAbQUWy0kJM1OtrNIQyh3gJj9FDVaMiqMIcQp2wOj4pKjxzc8jRwzuUQ1Sg6F9aQz1KwsljOoaC6sOT1IMKc6OORxihWI+g6p9QRDUiO22O4Xg/W0SFuCYf8lFwzA5RB8MH/Q8tWUsAZ5ImsQAAAABJRU5ErkJggg==>

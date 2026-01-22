## **AI Finance Assistant (Sidekick) – Personal Investment Decision Tool**

**AI Finance Assistant (Sidekick)** is a personal investment decision-support web application built with **Next.js, Supabase, and AI APIs**.

It helps individual investors define their investment framework, record decisions, and receive AI-assisted feedback — focusing on **long-term thinking rather than short-term trading**.



This project is designed as a **portfolio-grade full-stack application**, demonstrating authentication, data isolation, API design, and AI integration.

## **🚀 Local Development**

```
npm install
npm run dev
```



## **✨ Core Features**

### **🔐 Authentication & Authorization**

- Email & password authentication via **Supabase Auth**

- Secure **SSR session handling** with cookies

- Route protection using server-side guards

- Row Level Security (RLS) for user data isolation

  

### **📊 Investment Framework**

- Define personal investment principles:

  

  - Target return
  - Risk limits
  - Asset allocation rules
  - Holding constraints

- Save & update investment plans

- Each user owns their **private investment data**

  

### **🧠 AI-Assisted Analysis**

- User investment plans are sent to an AI model
- AI generates structured feedback:
  - Risk analysis
  - Logical inconsistencies
  - Behavioral warnings
- AI feedback is persisted and reloaded across sessions



### **📝 Decision Log**

- Record investment decisions with context
- Decisions are automatically linked to the authenticated user
- Backend protected by Supabase RLS policies



### **📈 Dashboard (In Progress / v0)**

- Current holdings overview
- Target vs actual allocation (ECharts planned)
- Cash ratio indicators
- Long-term compounding visualization



## **🧱 Tech Stack**

### **Frontend**

- **Next.js (App Router)**
- **TypeScript**
- **React Server Components**
- **shadcn/ui + Tailwind CSS**
- ECharts (planned for visualization)



### **Backend**

- **Next.js API Routes (Node.js runtime)**

- **Supabase PostgreSQL**

- **Supabase Auth**

- **Row Level Security (RLS)**

  

### **AI**

- External LLM API (Gemini / GPT compatible)
- Structured prompt → JSON-safe output
- AI response persistence



### **Deployment**

- **Vercel**

- Environment variables managed via Vercel dashboard

- Supabase hosted backend

  

## **👤 Author**

Built by **David Hou**

Full-stack developer focused on **Next.js, Supabase, and AI-powered applications**.

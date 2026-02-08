"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  price: string | null;
  images: string[];
  status: string;
  aiCaption: string | null;
  aiDescription: string | null;
  audioUrl: string | null;
  videoUrl: string | null;
}

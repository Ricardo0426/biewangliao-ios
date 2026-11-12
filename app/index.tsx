import { Redirect } from 'expo-router';
import React from 'react';

/** 根路径重定向到「日常」板块 */
export default function Index() {
  return <Redirect href="/daily" />;
}

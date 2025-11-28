import React from 'react';
import { View, Text,ScrollView,StyleSheet,TouchableOpacity, SafeAreaViewBase } from 'react-native';
import { Link } from 'expo-router';
import { useEffect,useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@react-navigation/elements';
const quickLinks=[
  {title:'Mark Attendance',subtitle:'Swipe by batch & date',href:'/(tabs)/attendance'},
  {title:'Insights',subtitle:'Stats & defaulters',href:'/(tabs)/insights'},
  {title:'Batches',subtitle:'Create or edit classes',href:'/batches'},
  {title:'Students',subtitle:'Roster & contacts',href:'/students'},
  {title:'Defaulters',subtitle:'Full monthly view',href:'/defaulters'},
]
const highlights = [
  { label: 'Overall Attendance', value: '92%' },
  { label: 'Today Present', value: '134' },
  { label: 'Batches Active', value: '08' },
];
const batches = [
  { id: 1, name: 'Batch A' },
  { id: 2, name: 'Batch B' },
  { id: 3, name: 'Batch C' },
];
export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe} >
      <ScrollView contentContainerStyle={styles.container}>

          <View style={styles.hero}>
            <Text style={styles.title}>ClassCheck</Text>
            <Text style={styles.subtitle}>Stay ahead of attendance</Text>
            <Text style={styles.body}>Jump back into marking, check trends, and catch defaulters before the month ends.</Text>
          </View>

          <View style={styles.highlights}>
            {highlights.map((item)=>(
              <View key={item.label} style={styles.highlightCard}>
                <Text style={styles.highlightValue}>{item.value}</Text>
                <Text style={styles.highlightLabel}>{item.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickLinks.map((item) => (
            <Link key={item.title} href={item.href} asChild>
              <TouchableOpacity style={styles.quickCard}>
                <Text style={styles.quickTitle}>{item.title}</Text>
                <Text style={styles.quickSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineHeader} >
            <Text style={styles.sectionTitle} >Today&apos;s Timeline</Text>
            <Text style={styles.timelineData} >{new Date().toLocaleDateString('en-US',{weekday:"short",day:"numeric",month:"short"})}</Text>
          </View>
          {
            batches.map((b)=>(
              <View key={b.id} style={styles.timelinerow}>
                <View>
                <Text style={styles.timelinetitle}>{b.name}</Text>
                <Text style={styles.timelinemeta}>Mark Attendance For Today</Text>
                </View>
                <Link  href="/(tabs)/attendance" asChild>
                <TouchableOpacity style={styles.timelinebtn}>
                  <Text style={styles.timelinebtntxt}>Mark</Text>
                </TouchableOpacity>
                </Link>
              </View>
            ))
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles=StyleSheet.create({
  safe:{
    flex: 1,
    backgroundColor:'#fdfdfdff'
  },
  container:{
    padding:20,
    gap:24
  },
  hero:{
    marginBottom:20,
    padding:24,
    minHeight:200,
    justifyContent:'center',
    backgroundColor: '#42ab65ff',
    borderRadius: 20,
    shadowColor: '#0b0b0bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title:{
    color:'#faf5f5ff',
    textTransform:'uppercase',
    letterSpacing:1.5,
    fontSize:32,
    marginBottom:8,
    fontWeight:'800'
  },
  subtitle:{
    color: '#f8f6f6ff',
    fontSize: 18,
    marginVertical: 4,
    fontWeight: '500'
  },
  body:{
    color: '#f8f5f5ff',
    fontSize: 14,
    lineHeight: 20
  },
  highlights:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  highlightCard:{
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  highlightValue:{
    color: '#1e293b',
    fontSize: 24,
    fontWeight: '700'
  },
  highlightLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4
  },
  sectionTitle:{
    color: '#1e293b',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  quickCard: {
    backgroundColor: '#42ab65ff',
    borderRadius: 16,
    padding: 20,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  quickSubtitle: {
    color: '#dbeafe',
    fontSize: 12,
    lineHeight: 16
  },
  timeline:{
    backgroundColor:"#ffffff",
    borderRadius:20,
    padding:24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  timelineHeader:{
    flexDirection:'row',
    justifyContent:"space-between",
    alignItems:'center',
    marginBottom:16
  },
  timelineData:{
    color:'#64748b',
    fontSize:14,
    fontWeight:'600'
  },
  timelinerow:{
    flexDirection:'row',
    alignItems:'center',
    gap:16,
    paddingVertical:16,
    borderBottomWidth: 1,
    borderBottomColor:'#f1f5f9'
  },
  timelinetitle:{
    color:"#1e293b",
    fontSize:16,
    fontWeight:600
  },
  timelinemeta:{
    color:"#64748b",
    fontSize:12
  },
  timelinebtn:{
    marginLeft:'auto',
    backgroundColor:'#42ab65ff',
    paddingVertical:8,
    paddingHorizontal:16,
    borderRadius:20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timelinebtntxt:{
    color:'#ffffff',
    fontWeight:600,
    fontSize: 14
  }

})

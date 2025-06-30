#!/usr/bin/env python3
"""
SecureCollab Complete Demo Script

This script demonstrates the full SecureCollab workflow:
1. Backend encryption verification
2. Frontend integration testing
3. Multi-party computation simulation
4. End-to-end privacy guarantees

Usage: python3 demo_script.py
"""

import subprocess
import time
import webbrowser
import os
from pathlib import Path

class SecureCollabDemo:
    def __init__(self):
        self.project_root = Path("/Users/sidousan/vibhathon/securecollab")
        self.backend_url = "http://localhost:4943"
        self.frontend_url = "http://localhost:5173"
    
    def check_prerequisites(self):
        """Check if all required services are running"""
        print("🔍 Checking Prerequisites...")
        
        # Check if dfx is running
        try:
            result = subprocess.run(["dfx", "ping"], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                print("   ✅ Internet Computer replica is running")
            else:
                print("   ❌ Internet Computer replica not running")
                return False
        except Exception as e:
            print(f"   ❌ dfx not available: {e}")
            return False
        
        # Check if backend is deployed
        try:
            result = subprocess.run(["dfx", "canister", "status", "backend"], 
                                  capture_output=True, text=True, timeout=5)
            if "Running" in result.stdout:
                print("   ✅ Backend canister is deployed and running")
            else:
                print("   ❌ Backend canister not running")
                return False
        except Exception as e:
            print(f"   ❌ Backend status check failed: {e}")
            return False
        
        return True
    
    def start_frontend(self):
        """Start the frontend development server"""
        print("\n🚀 Starting Frontend Development Server...")
        
        frontend_dir = self.project_root / "src" / "frontend"
        
        try:
            # Start the frontend server in the background
            process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            print("   ⏳ Waiting for frontend to start...")
            time.sleep(5)  # Give it time to start
            
            # Check if it's running
            if process.poll() is None:
                print(f"   ✅ Frontend server started at {self.frontend_url}")
                return process
            else:
                stdout, stderr = process.communicate()
                print(f"   ❌ Frontend failed to start: {stderr}")
                return None
                
        except Exception as e:
            print(f"   ❌ Failed to start frontend: {e}")
            return None
    
    def demonstrate_encryption(self):
        """Run the encryption demonstration"""
        print("\n🔐 Demonstrating Encryption Capabilities...")
        
        try:
            result = subprocess.run(
                ["./encryption_demo"],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                print("   ✅ Encryption demo completed successfully")
                # Show key highlights from the output
                lines = result.stdout.split('\n')
                for line in lines:
                    if "✅" in line and ("Secure" in line or "Privacy" in line or "Encryption" in line):
                        print(f"   {line.strip()}")
            else:
                print(f"   ❌ Encryption demo failed: {result.stderr}")
                
        except Exception as e:
            print(f"   ❌ Failed to run encryption demo: {e}")
    
    def create_sample_data(self):
        """Create sample CSV data for testing"""
        print("\n📊 Creating Sample Healthcare Data...")
        
        sample_csv = """patient_id,age,treatment,outcome,recovery_days,side_effects,hospital_id
P001,45,Drug_X,Improved,12,None,BGH_001
P002,62,Drug_Y,Improved,18,Mild,BGH_002
P003,38,Drug_X,Cured,8,None,BGH_003
P004,55,Drug_Y,Improved,22,Moderate,NOV_001
P005,41,Drug_X,Cured,10,None,NOV_002
P006,67,Drug_Y,No_Change,30,Severe,NOV_003
P007,33,Drug_X,Improved,14,Mild,MIT_001
P008,58,Drug_Y,Improved,16,None,MIT_002
P009,49,Drug_X,Cured,9,None,MIT_003
P010,71,Drug_Y,Improved,25,Moderate,MIT_004
P011,44,Drug_X,Improved,11,None,BGH_004
P012,59,Drug_Y,Cured,19,Mild,BGH_005
P013,36,Drug_X,Improved,13,None,NOV_004
P014,52,Drug_Y,No_Change,28,Severe,NOV_005
P015,47,Drug_X,Cured,7,None,MIT_005"""
        
        sample_file = self.project_root / "sample_healthcare_data.csv"
        with open(sample_file, 'w') as f:
            f.write(sample_csv)
        
        print(f"   ✅ Created sample data: {sample_file}")
        print(f"   📈 Contains 15 patient records across 3 hospitals")
        print(f"   🏥 Hospitals: Boston General, Novartis, MIT Research Lab")
        print(f"   💊 Treatments: Drug_X vs Drug_Y effectiveness comparison")
        
        return sample_file
    
    def show_demo_instructions(self):
        """Show instructions for the interactive demo"""
        print("\n" + "="*60)
        print("🎯 SECURECOLLAB INTERACTIVE DEMO INSTRUCTIONS")
        print("="*60)
        
        print("\n🌐 Frontend Access:")
        print(f"   Open your browser to: {self.frontend_url}")
        print("   The Enterprise Dashboard should load automatically")
        
        print("\n📋 Demo Workflow:")
        print("   1. 📁 UPLOAD DATA:")
        print("      - Go to the 'Datasets' tab")
        print("      - Drag & drop 'sample_healthcare_data.csv'")
        print("      - Watch the encryption progress")
        print("      - Verify data appears in encrypted dataset list")
        
        print("\n   2. 👥 SIMULATE MULTI-PARTY:")
        print("      - Use the company dropdown (top-right)")
        print("      - Switch between: Boston General, Novartis, MIT")
        print("      - Each company sees their own perspective")
        
        print("\n   3. 🔬 CREATE COMPUTATION REQUEST:")
        print("      - Go to 'Computation Requests' tab")
        print("      - Click 'New Request'")
        print("      - Fill in research question")
        print("      - Submit request")
        
        print("\n   4. ✅ APPROVAL WORKFLOW:")
        print("      - Switch to other companies using dropdown")
        print("      - Go to 'Pending Approvals' tab")
        print("      - Approve the computation request")
        print("      - Watch status change to 'Approved'")
        
        print("\n   5. 📊 VIEW RESULTS:")
        print("      - Go to 'Results' tab")
        print("      - See privacy-preserving computation results")
        print("      - Check privacy guarantees section")
        
        print("\n   6. 🤖 AI ASSISTANT:")
        print("      - Go to 'AI Assistant' tab")
        print("      - Ask questions about secure computation")
        print("      - Get privacy-preserving AI responses")
        
        print("\n🔒 Key Features to Notice:")
        print("   ✅ Data is encrypted before storage")
        print("   ✅ Multi-party approval required for computation")
        print("   ✅ Results show insights without exposing raw data")
        print("   ✅ Privacy guarantees displayed throughout")
        print("   ✅ Activity feed shows collaboration timeline")
        print("   ✅ Enterprise-grade UI and workflow")
        
        print("\n" + "="*60)
    
    def open_browser(self):
        """Open the browser to the frontend"""
        print(f"\n🌐 Opening browser to {self.frontend_url}...")
        try:
            webbrowser.open(self.frontend_url)
            print("   ✅ Browser opened")
        except Exception as e:
            print(f"   ❌ Failed to open browser: {e}")
            print(f"   Please manually open: {self.frontend_url}")
    
    def run_complete_demo(self):
        """Run the complete demonstration"""
        print("🚀 SecureCollab Complete Demo")
        print("="*50)
        
        # Step 1: Check prerequisites
        if not self.check_prerequisites():
            print("\n❌ Prerequisites not met. Please run:")
            print("   dfx start --background")
            print("   dfx deploy")
            return False
        
        # Step 2: Demonstrate encryption
        self.demonstrate_encryption()
        
        # Step 3: Create sample data
        sample_file = self.create_sample_data()
        
        # Step 4: Start frontend
        frontend_process = self.start_frontend()
        if not frontend_process:
            print("\n❌ Could not start frontend")
            return False
        
        # Step 5: Show demo instructions
        self.show_demo_instructions()
        
        # Step 6: Open browser
        self.open_browser()
        
        # Step 7: Keep running
        print("\n⏳ Demo is now running...")
        print("   Frontend: Running in background")
        print("   Backend: Internet Computer replica")
        print("   Sample Data: Available for upload")
        
        print("\n🎯 Next Steps:")
        print("   1. Follow the demo instructions above")
        print("   2. Upload the sample CSV file")
        print("   3. Test the multi-party computation workflow")
        print("   4. Press Ctrl+C to stop the demo")
        
        try:
            # Keep the demo running
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n\n🛑 Stopping demo...")
            if frontend_process:
                frontend_process.terminate()
                print("   ✅ Frontend stopped")
            print("   ✅ Demo completed")
        
        return True

def main():
    demo = SecureCollabDemo()
    success = demo.run_complete_demo()
    
    if success:
        print("\n🎉 SecureCollab demo completed successfully!")
        print("   All encryption and privacy features demonstrated.")
    else:
        print("\n❌ Demo encountered issues.")
        print("   Please check the prerequisites and try again.")

if __name__ == "__main__":
    main()

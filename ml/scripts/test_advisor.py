from ml.services.rag.advisor import AdvisorService

def chat():
    print("🤖 ACTIVATING WEALTHWISE ADVISOR...")
    advisor = AdvisorService()
    
    # Question 1: Specific Data Retrieval
    q1 = "How much have I spent on Starbucks recently?"
    print(f"\n👤 User: {q1}")
    print("...Thinking (Retrieving + Generating)...")
    ans1 = advisor.ask(q1)
    print(f"🤖 Advisor: {ans1}")
    
    # Question 2: Analysis
    q2 = "Do I spend too much on games?"
    print(f"\n👤 User: {q2}")
    print("...Thinking...")
    ans2 = advisor.ask(q2)
    print(f"🤖 Advisor: {ans2}")

if __name__ == "__main__":
    chat()

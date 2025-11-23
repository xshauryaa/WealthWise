import pytest
from unittest.mock import MagicMock, patch
from ml.services.rag.advisor import AdvisorService

@pytest.fixture
def mock_settings(mocker):
    mocker.patch("ml.config.settings.get_settings")

def test_advisor_prompt_construction(mock_settings):
    with patch("ml.services.rag.advisor.genai") as MockGenAI, \
         patch("ml.services.rag.advisor.ContextBuilder") as MockBuilderClass:
        
        mock_builder_instance = MockBuilderClass.return_value
        mock_builder_instance.retrieve_context.return_value = "User spent $50 on Shoes."
        
        mock_model = MockGenAI.GenerativeModel.return_value
        mock_model.generate_content.return_value.text = "Yes, you bought shoes."

        advisor = AdvisorService()
        # FIX: Added user_id="u1"
        advisor.ask("u1", "Did I buy shoes?")
        
        call_args = mock_model.generate_content.call_args
        generated_prompt = call_args[0][0]
        
        assert "User spent $50 on Shoes" in generated_prompt
        assert "You are WealthWise" in generated_prompt

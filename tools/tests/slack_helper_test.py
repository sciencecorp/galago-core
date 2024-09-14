import unittest
import sys 
from tools.toolbox.utils import get_slack_id_from_scientist_name

sys.path.append("../..")

class TestSlackToolHelpers(unittest.TestCase):
        
    def test_get_slack_id_from_scientist_name(self) -> None:
        #Test 1
        scientist = "Alberto"
        slack_id = get_slack_id_from_scientist_name(scientist)
        self.assertEqual(slack_id, "U04P85SJABD")
        #Test 2
        scientist = "John"
        slack_id = get_slack_id_from_scientist_name(scientist)
        self.assertEqual(slack_id, "unknown")

if __name__ == '__main__':
    unittest.main()
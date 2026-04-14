from .helper import setup_project_to_step, get_faculty_employee_id


def test_step_8_distribution(client, auth_headers_client, auth_headers_faculty, auth_headers_director):
    coord_id = get_faculty_employee_id(client, auth_headers_faculty)
    pid = setup_project_to_step(7, client, auth_headers_client, auth_headers_faculty, auth_headers_director)
    # The helper step 6 created a receipt with Total_Received = 200.6
    res = client.post(f"/api/consultancy/{pid}/distribution", json={
        "distributions": [
            {"Payee_Type": "PROJECT_COORDINATOR", "Employee_ID": coord_id, "Allocated_Amt": 140.42},
            {"Payee_Type": "OFFICE_SHARE", "Employee_ID": None, "Allocated_Amt": 60.18}
        ]
    }, headers=auth_headers_faculty)
    assert res.status_code == 200
    assert res.json()["project_status"] == "AMOUNT_DISTRIBUTION"

def test_step_8_distribution_mismatch(client, auth_headers_client, auth_headers_faculty, auth_headers_director):
    coord_id = get_faculty_employee_id(client, auth_headers_faculty)
    pid = setup_project_to_step(7, client, auth_headers_client, auth_headers_faculty, auth_headers_director)
    res = client.post(f"/api/consultancy/{pid}/distribution", json={
        "distributions": [
            {"Payee_Type": "PROJECT_COORDINATOR", "Employee_ID": coord_id, "Allocated_Amt": 100.00},
            {"Payee_Type": "OFFICE_SHARE", "Employee_ID": None, "Allocated_Amt": 50.00}
        ]
    }, headers=auth_headers_faculty)
    assert res.status_code == 400

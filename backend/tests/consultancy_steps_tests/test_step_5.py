from .helper import setup_project_to_step

def test_step_5_proforma(client, auth_headers_client, auth_headers_faculty, auth_headers_director):
    pid = setup_project_to_step(4, client, auth_headers_client, auth_headers_faculty, auth_headers_director)
    res = client.post(f"/api/consultancy/{pid}/proforma-invoice", json={
        "HSN_SAC_Code": "998311",
        "Taxable_Value": 1000.0,
        "Tax_Amount": 180.0
    }, headers=auth_headers_faculty)
    assert res.status_code == 200
    assert res.json()["project_status"] == "PROFORMA_INVOICE"

from .helper import setup_project_to_step

def test_step_6_tax(client, auth_headers_client, auth_headers_faculty, auth_headers_director):
    pid = setup_project_to_step(5, client, auth_headers_client, auth_headers_faculty, auth_headers_director)
    res = client.post(f"/api/consultancy/{pid}/tax-invoice-receipt", json={
        "Voucher_Number": f"VR-{pid}",
        "Receipt_Date": "2026-04-01",
        "Total_Received": 1180.0,
        "TDS_Deducted": 100.0,
        "Bank_Trans_Ref": f"UTR-{pid}123"
    }, headers=auth_headers_faculty)
    assert res.status_code == 200
    assert res.json()["project_status"] == "TAX_INVOICE_AND_RECEIPT"

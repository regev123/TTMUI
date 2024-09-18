const ABP_CLIENT_DISABLE =
  "sed -i 's|^EPC_TTM/abp.check=.*|EPC_TTM/abp.check=false|' EPC_TTM.properties";

const OMS_CLIENT_DISABLE =
  "sed -i 's|^EPC_TTM/oms.check=.*|EPC_TTM/oms.check=false|' EPC_TTM.properties";

const OMS_SE_CLIENT_DISABLE =
  "sed -i 's|^EPC_TTM/oms_se.check=.*|EPC_TTM/oms_se.check=false|' EPC_TTM.properties";

const MCSS_SE_CLIENT_DISABLE =
  "sed -i 's|^EPC_TTM/mcss_se.check=.*|EPC_TTM/mcss_se.check=false|' EPC_TTM.properties";

const ACPE_CLIENT_DISABLE =
  "sed -i 's|^EPC_TTM/acpe.check=.*|EPC_TTM/acpe.check=false|' EPC_TTM.properties";

const OVERRIDE_DATA_PUMP_FILE =
  "sed -i 's|^#Profiles_Configuration/override_datapump_file=.*|Profiles_Configuration/override_datapump_file=YES|' EPC_TTM.properties";

const ABP_EPCT_DP_DIR_DISABLE =
  "sed -i 's|^Profiles_Configuration/ABP/ABP.profile/abp.EPCT_DP_DIR=DP_DMP_EPCT.*|#Profiles_Configuration/ABP/ABP.profile/abp.EPCT_DP_DIR=DP_DMP_EPCT|' EPC_TTM.properties";

const ABP_EPCT_DP_PATH =
  "sed -i 's|^#Profiles_Configuration/ABP/ABP.profile/abp.EPCT_DP_PATH=.*|Profiles_Configuration/ABP/ABP.profile/abp.EPCT_DP_PATH=ABP_EPCT_DP_PATH|' EPC_TTM.properties";

const ABP_SRC_DB_USER =
  "sed -i 's|Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_user=.*|Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_user=ABP_SRC_DB_USER|' EPC_TTM.properties";

const ABP_SRC_DB_PASSWORD =
  "sed -i 's|Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_password=.*|Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_password=ABP_SRC_DB_PASSWORD|' EPC_TTM.properties";

const ABP_SRC_DB_INSTANCE =
  "sed -i 's|Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_instance=.*|Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_instance=ABP_SRC_DB_INSTANCE|' EPC_TTM.properties";

const ABP_SRC_DB_USER_DISABLE =
  "sed -i 's|Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_user=.*|#Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_user=.*|' EPC_TTM.properties";

const ABP_SRC_DB_PASSWORD_DISABLE =
  "sed -i 's|Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_password=.*|#Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_password=.*|' EPC_TTM.properties";

const ABP_SRC_DB_INSTANCE_DISABLE =
  "sed -i 's|Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_instance=.*|#Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_instance=.*|' EPC_TTM.properties";

const ABP_TRG_DB_CONN_STRING =
  "sed -i 's|^#Profiles_Configuration/ABP/ABP.profile/abp.trg_db_conn_string=.*|Profiles_Configuration/ABP/ABP.profile/abp.trg_db_conn_string=ABP_TRG_DB_CONN_STRING|' EPC_TTM.properties";

/////////////////////////////////////////////////////OMS

const OMS_EPCT_DP_DIR_DISABLE =
  "sed -i 's|^Profiles_Configuration/OMS/OMS.profile/oms.EPCT_DP_DIR=DP_DMP_EPCT.*|#Profiles_Configuration/OMS/OMS.profile/oms.EPCT_DP_DIR=DP_DMP_EPCT|' EPC_TTM.properties";

const OMS_EPCT_DP_PATH =
  "sed -i 's|^#Profiles_Configuration/OMS/OMS.profile/oms.EPCT_DP_PATH=.*|Profiles_Configuration/OMS/OMS.profile/oms.EPCT_DP_PATH=OMS_EPCT_DP_PATH|' EPC_TTM.properties";

const OMS_SRC_DB_USER =
  "sed -i 's|Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_user=.*|Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_user=OMS_SRC_DB_USER|' EPC_TTM.properties";

const OMS_SRC_DB_PASSWORD =
  "sed -i 's|Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_password=.*|Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_password=OMS_SRC_DB_PASSWORD|' EPC_TTM.properties";

const OMS_SRC_DB_INSTANCE =
  "sed -i 's|Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_instance=.*|Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_instance=OMS_SRC_DB_INSTANCE|' EPC_TTM.properties";

const OMS_SRC_DB_USER_DISABLE =
  "sed -i 's|Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_user=.*|#Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_user=.*|' EPC_TTM.properties";

const OMS_SRC_DB_PASSWORD_DISABLE =
  "sed -i 's|Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_password=.*|#Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_password=.*|' EPC_TTM.properties";

const OMS_SRC_DB_INSTANCE_DISABLE =
  "sed -i 's|Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_instance=.*|#Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_instance=.*|' EPC_TTM.properties";

const OMS_TRG_DB_CONN_STRING =
  "sed -i 's|^#Profiles_Configuration/OMS/OMS.profile/oms.trg_db_conn_string=.*|Profiles_Configuration/OMS/OMS.profile/oms.trg_db_conn_string=OMS_TRG_DB_CONN_STRING|' EPC_TTM.properties";

//////////////////////////////////////////////////////////////// OMS_SE

const OMS_SE_EPCT_DP_DIR_DISABLE =
  "sed -i 's|^Profiles_Configuration/OMS_SE/OMS_SE.profile/oms_se.EPCT_DP_DIR=DP_DMP_EPCT.*|#Profiles_Configuration/OMS_SE/OMS_SE.profile/oms_se.EPCT_DP_DIR=DP_DMP_EPCT|' EPC_TTM.properties";

const OMS_SE_EPCT_DP_PATH =
  "sed -i 's|^#Profiles_Configuration/OMS_SE/OMS_SE.profile/oms_se.EPCT_DP_PATH=.*|Profiles_Configuration/OMS_SE/OMS_SE.profile/oms_se.EPCT_DP_PATH=OMS_SE_EPCT_DP_PATH|' EPC_TTM.properties";

const OMS_SE_SRC_DB_USER =
  "sed -i 's|Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_user=.*|Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_user=OMS_SE_SRC_DB_USER|' EPC_TTM.properties";

const OMS_SE_SRC_DB_PASSWORD =
  "sed -i 's|Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_password=.*|Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_password=OMS_SE_SRC_DB_PASSWORD|' EPC_TTM.properties";

const OMS_SE_SRC_DB_INSTANCE =
  "sed -i 's|Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_instance=.*|Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_instance=OMS_SE_SRC_DB_INSTANCE|' EPC_TTM.properties";

const OMS_SE_SRC_DB_USER_DISABLE =
  "sed -i 's|Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_user=.*|#Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_user=.*|' EPC_TTM.properties";

const OMS_SE_SRC_DB_PASSWORD_DISABLE =
  "sed -i 's|Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_password=.*|#Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_password=.*|' EPC_TTM.properties";

const OMS_SE_SRC_DB_INSTANCE_DISABLE =
  "sed -i 's|Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_instance=.*|#Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_instance=.*|' EPC_TTM.properties";

const OMS_SE_TRG_DB_CONN_STRING =
  "sed -i 's|^#Profiles_Configuration/OMS_SE/OMS_SE.profile/oms_se.trg_db_conn_string=.*|Profiles_Configuration/OMS_SE/OMS_SE.profile/oms_se.trg_db_conn_string=OMS_SE_TRG_DB_CONN_STRING|' EPC_TTM.properties";

//////////////////////////////////////////////////////// MCSS_SE

const MCSS_SE_EPCT_DP_DIR_DISABLE =
  "sed -i 's|^Profiles_Configuration/MCSS_SE/MCSS_SE.profile/mcss_se.EPCT_DP_DIR=DP_DMP_EPCT.*|#Profiles_Configuration/MCSS_SE/MCSS_SE.profile/mcss_se.EPCT_DP_DIR=DP_DMP_EPCT|' EPC_TTM.properties";

const MCSS_SE_EPCT_DP_PATH =
  "sed -i 's|^#Profiles_Configuration/MCSS_SE/MCSS_SE.profile/mcss_se.EPCT_DP_PATH=.*|Profiles_Configuration/MCSS_SE/MCSS_SE.profile/mcss_se.EPCT_DP_PATH=MCSS_SE_EPCT_DP_PATH|' EPC_TTM.properties";

const MCSS_SE_SRC_DB_USER =
  "sed -i 's|Profiles_Configuration/MCSS_SE/MCSS_SE.profile/Source.ref.DB/mcss_se.src_ref_db_user=.*|Profiles_Configuration/MCSS_SE/MCSS_SE.profile/Source.ref.DB/mcss_se.src_ref_db_user=MCSS_SE_SRC_DB_USER|' EPC_TTM.properties";

const MCSS_SE_SRC_DB_PASSWORD =
  "sed -i 's|Profiles_Configuration/MCSS_SE/MCSS_SE.profile/Source.ref.DB/mcss_se.src_ref_db_password=.*|Profiles_Configuration/MCSS_SE/MCSS_SE.profile/Source.ref.DB/mcss_se.src_ref_db_password=MCSS_SE_SRC_DB_PASSWORD|' EPC_TTM.properties";

const MCSS_SE_SRC_DB_INSTANCE =
  "sed -i 's|Profiles_Configuration/MCSS_SE/MCSS_SE.profile/Source.ref.DB/mcss_se.src_ref_db_instance=.*|Profiles_Configuration/MCSS_SE/MCSS_SE.profile/Source.ref.DB/mcss_se.src_ref_db_instance=MCSS_SE_SRC_DB_INSTANCE|' EPC_TTM.properties";

const MCSS_SE_SRC_DB_USER_DISABLE =
  "sed -i 's|Profiles_Configuration/MCSS_SE/MCSS_SE.profile/Source.ref.DB/mcss_se.src_ref_db_user=.*|#Profiles_Configuration/MCSS_SE/MCSS_SE.profile/Source.ref.DB/mcss_se.src_ref_db_user=.*|' EPC_TTM.properties";

const MCSS_SE_SRC_DB_PASSWORD_DISABLE =
  "sed -i 's|Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_password=.*|#Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_password=.*|' EPC_TTM.properties";

const MCSS_SE_SRC_DB_INSTANCE_DISABLE =
  "sed -i 's|Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_instance=.*|#Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_instance=.*|' EPC_TTM.properties";

const MCSS_SE_TRG_DB_CONN_STRING =
  "sed -i 's|^#Profiles_Configuration/MCSS_SE/MCSS_SE.profile/mcss_se.trg_db_conn_string=.*|Profiles_Configuration/MCSS_SE/MCSS_SE.profile/mcss_se.trg_db_conn_string=MCSS_SE_TRG_DB_CONN_STRING|' EPC_TTM.properties";

//////////////////////////////////////////////////////////// ACPE

const ACPE_EPCT_DP_DIR_DISABLE =
  "sed -i 's|^Profiles_Configuration/ACPE/ACPE.profile/acpe.EPCT_DP_DIR=DP_DMP_EPCT.*|#Profiles_Configuration/ACPE/ACPE.profile/acpe.EPCT_DP_DIR=DP_DMP_EPCT|' EPC_TTM.properties";

const ACPE_EPCT_DP_PATH =
  "sed -i 's|^#Profiles_Configuration/ACPE/ACPE.profile/acpe.EPCT_DP_PATH=.*|Profiles_Configuration/ACPE/ACPE.profile/acpe.EPCT_DP_PATH=ACPE_EPCT_DP_PATH|' EPC_TTM.properties";

const ACPE_SRC_DB_USER =
  "sed -i 's|Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_user=.*|Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_user=ACPE_SRC_DB_USER|' EPC_TTM.properties";

const ACPE_SRC_DB_PASSWORD =
  "sed -i 's|Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_password=.*|Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_password=ACPE_SRC_DB_PASSWORD|' EPC_TTM.properties";

const ACPE_SRC_DB_INSTANCE =
  "sed -i 's|Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_instance=.*|Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_instance=ACPE_SRC_DB_INSTANCE|' EPC_TTM.properties";

const ACPE_SRC_DB_USER_DISABLE =
  "sed -i 's|Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_user=.*|#Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_user=.*|' EPC_TTM.properties";

const ACPE_SRC_DB_PASSWORD_DISABLE =
  "sed -i 's|Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_password=.*|#Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_password=.*|' EPC_TTM.properties";

const ACPE_SRC_DB_INSTANCE_DISABLE =
  "sed -i 's|Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_instance=.*|#Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_instance=.*|' EPC_TTM.properties";

const ACPE_TRG_DB_CONN_STRING =
  "sed -i 's|^#Profiles_Configuration/ACPE/ACPE.profile/acpe.trg_db_conn_string=.*|Profiles_Configuration/ACPE/ACPE.profile/acpe.trg_db_conn_string=ACPE_TRG_DB_CONN_STRING|' EPC_TTM.properties";

const CLIENTS_STRING = `sed -i 's|^export PRODUCTS_LIST="[^"]*"|export PRODUCTS_LIST="CLIENTS"|' MEC.profile.ksh`;

module.exports = {
  ABP_CLIENT_DISABLE,
  OMS_CLIENT_DISABLE,
  OMS_SE_CLIENT_DISABLE,
  MCSS_SE_CLIENT_DISABLE,
  ACPE_CLIENT_DISABLE,
  OVERRIDE_DATA_PUMP_FILE,
  ABP_EPCT_DP_DIR_DISABLE,
  ABP_EPCT_DP_PATH,
  ABP_SRC_DB_USER,
  ABP_SRC_DB_PASSWORD,
  ABP_SRC_DB_INSTANCE,
  ABP_SRC_DB_USER_DISABLE,
  ABP_SRC_DB_PASSWORD_DISABLE,
  ABP_SRC_DB_INSTANCE_DISABLE,
  ABP_TRG_DB_CONN_STRING,
  OMS_EPCT_DP_DIR_DISABLE,
  OMS_EPCT_DP_PATH,
  OMS_SRC_DB_USER,
  OMS_SRC_DB_PASSWORD,
  OMS_SRC_DB_INSTANCE,
  OMS_SRC_DB_USER_DISABLE,
  OMS_SRC_DB_PASSWORD_DISABLE,
  OMS_SRC_DB_INSTANCE_DISABLE,
  OMS_TRG_DB_CONN_STRING,
  OMS_SE_EPCT_DP_DIR_DISABLE,
  OMS_SE_EPCT_DP_PATH,
  OMS_SE_SRC_DB_USER,
  OMS_SE_SRC_DB_PASSWORD,
  OMS_SE_SRC_DB_INSTANCE,
  OMS_SE_SRC_DB_USER_DISABLE,
  OMS_SE_SRC_DB_PASSWORD_DISABLE,
  OMS_SE_SRC_DB_INSTANCE_DISABLE,
  OMS_SE_TRG_DB_CONN_STRING,
  MCSS_SE_EPCT_DP_DIR_DISABLE,
  MCSS_SE_EPCT_DP_PATH,
  MCSS_SE_SRC_DB_USER,
  MCSS_SE_SRC_DB_PASSWORD,
  MCSS_SE_SRC_DB_INSTANCE,
  MCSS_SE_SRC_DB_USER_DISABLE,
  MCSS_SE_SRC_DB_PASSWORD_DISABLE,
  MCSS_SE_SRC_DB_INSTANCE_DISABLE,
  MCSS_SE_TRG_DB_CONN_STRING,
  ACPE_EPCT_DP_DIR_DISABLE,
  ACPE_EPCT_DP_PATH,
  ACPE_SRC_DB_USER,
  ACPE_SRC_DB_PASSWORD,
  ACPE_SRC_DB_INSTANCE,
  ACPE_SRC_DB_USER_DISABLE,
  ACPE_SRC_DB_PASSWORD_DISABLE,
  ACPE_SRC_DB_INSTANCE_DISABLE,
  ACPE_TRG_DB_CONN_STRING,
  CLIENTS_STRING,
};

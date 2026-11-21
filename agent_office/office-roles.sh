# Agent Office — 角色啟動指令
# 用法：先 `source` 這個檔（或把它加進 ~/.zshrc），之後要以某個角色工作，
# 就用對應指令開 Claude Code。那個視窗在辦公室裡就是對應的員工。
# 同時多開幾個視窗、各用不同角色 → 辦公室裡就同時站著好幾隻，各做各的。
#
#   source ~/Python-Data-Analysis/agent_office/office-roles.sh
#   office-pm      # 開一個「專案PM」視窗
#   office-dev     # 開一個「工程師」視窗
#   office-mkt     # 開一個「行銷」視窗
#   office-boss    # 開一個「主管」視窗
#
# 想換動物：把下面的 OFFICE_AGENT_ANIMAL 改掉即可。
# 動物：cat dog rabbit panda fox bear frog penguin
# 小新風：shin nene masao bo kazama hiroshi misae shiro

office-pm()   { OFFICE_AGENT_ID=pm   OFFICE_AGENT_NAME="專案PM"  OFFICE_AGENT_ROLE="專案負責" OFFICE_AGENT_ANIMAL=bear    claude "$@"; }
office-dev()  { OFFICE_AGENT_ID=dev  OFFICE_AGENT_NAME="工程師"  OFFICE_AGENT_ROLE="寫程式"   OFFICE_AGENT_ANIMAL=cat     claude "$@"; }
office-mkt()  { OFFICE_AGENT_ID=mkt  OFFICE_AGENT_NAME="行銷"    OFFICE_AGENT_ROLE="行銷"     OFFICE_AGENT_ANIMAL=fox     claude "$@"; }
office-boss() { OFFICE_AGENT_ID=boss OFFICE_AGENT_NAME="主管"    OFFICE_AGENT_ROLE="管理"     OFFICE_AGENT_ANIMAL=panda   claude "$@"; }

# Codex 版（若你也用 Codex，當第二個來源）：
office-review() { OFFICE_AGENT_ID=review OFFICE_AGENT_NAME="審查員" OFFICE_AGENT_ROLE="審查" OFFICE_AGENT_ANIMAL=penguin codex "$@"; }
